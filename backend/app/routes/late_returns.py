from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..database import get_transaction_details, get_user_details, add_log
from ..email_service import send_late_return_email, send_multiple_late_notices
from datetime import datetime

late_returns_bp = Blueprint('late_returns', __name__)

@late_returns_bp.route('/send-late-notices', methods=['POST'])
@jwt_required()  # Use JWT authentication
def send_late_notices():
    """
    Send email notifications to users with late returns
    Expected JSON payload: { transaction_ids: [1, 2, 3] }
    """
    # Get the user email from JWT token
    user_email = get_jwt_identity()
    
    if not user_email:
        return jsonify({"success": False, "message": "Authentication required"}), 401
    
    data = request.json
    transaction_ids = data.get('transaction_ids', [])
    
    if not transaction_ids:
        return jsonify({"success": False, "message": "No transactions selected"}), 400
    
    recipients_data = []
    
    for transaction_id in transaction_ids:
        # Get transaction details
        transaction = get_transaction_details(transaction_id)
        if not transaction:
            print(f"No transaction details found for ID: {transaction_id}")
            continue
            
        # Skip if no email or name
        if not transaction.get('user_email') or not transaction.get('user_name'):
            print(f"No email or name found for transaction ID: {transaction_id}")
            continue
            
        # Skip if not marked as late
        if not transaction.get('is_late'):
            print(f"Transaction ID {transaction_id} is not marked as late")
            continue
            
        # Format the due date for display
        due_date = transaction.get('due_date')
        formatted_due_date = due_date.split('T')[0] if 'T' in due_date else due_date
        
        # Calculate days late for display purposes only
        try:
            due_date_obj = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            days_late = (datetime.now() - due_date_obj).days
        except Exception as e:
            print(f"Error calculating days late for transaction ID {transaction_id}: {str(e)}")
            days_late = 0  # Default to 0 if calculation fails
            
        recipients_data.append({
            'email': transaction['user_email'],
            'name': transaction['user_name'],
            'book_title': transaction.get('title', 'Unknown Book'),
            'due_date': formatted_due_date,
            'days_late': days_late
        })
    
    if not recipients_data:
        return jsonify({"success": False, "message": "No valid recipients found"}), 400
    
    # Send emails to all recipients
    result = send_multiple_late_notices(recipients_data)
    
    if result['success']:
        # Log the action
        add_log(user_email, f"sent late return notices to {len(result['sent'])} users")
        
    return jsonify(result)