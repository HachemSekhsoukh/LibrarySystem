"""
Routes related to resources (books and other library items)
"""

from flask import jsonify, request
from app import app
from app.database import get_resources, add_resource, delete_resource, update_resource, get_resource_history, add_comment, get_comments, add_report, delete_comment, supabase, delete_report
import pandas as pd
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import io

@app.route('/api/resources', methods=['GET'])
def resources():
    """
    API endpoint to retrieve all resources (books)
    """
    resource_list = get_resources()
    return jsonify(resource_list)

@app.route('/api/resources', methods=['POST'])
@jwt_required()
def add_resource_endpoint():
    """
    API endpoint to add a new resource (book)
    """
    user_email = get_jwt_identity()
    data = request.json

    # Validate required fields
    required_fields = ["r_inventoryNum", "r_title", "r_author", "r_editor", "r_ISBN", "r_price", "r_cote", "r_receivingDate", "r_status", "r_observation", "r_type", "r_description","r_edition",  "r_resume"]
    
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    # Call the function to add the resource
    result = add_resource(user_email,data)

    if result.get('success'):
        return jsonify({
            "message": "Resource added successfully",
            "resource": result.get('resource')
        }), 201
    else:
        return jsonify({
            "error": result.get('error', 'An unknown error occurred')
        }), 500

@app.route('/api/resources/<int:resource_id>', methods=['DELETE'])
@jwt_required()
def remove_resource(resource_id):
    """
    API endpoint to delete a resource by ID.
    """
    user_email = get_jwt_identity()
    result = delete_resource(user_email,resource_id)
    return jsonify(result), (200 if result['success'] else 400)

@app.route('/api/resources/<int:resource_id>', methods=['PUT'])
@jwt_required()
def update_resource_endpoint(resource_id):
    """
    API endpoint to update a resource by ID.
    """
    data = request.json
    user_email = get_jwt_identity()
    # Validate required fields
    required_fields = ["r_inventoryNum", "r_title", "r_author", "r_editor", "r_ISBN", "r_price", "r_cote", "r_receivingDate", "r_status", "r_observation", "r_type", "r_description","r_edition",  "r_resume"]
    
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    # Call the function to update the resource
    result = update_resource(user_email,resource_id, data)
    
    if result.get('success'):
        return jsonify({
            "message": "Resource updated successfully",
            "resource": result.get('resource')
        }), 200
    else:
        return jsonify({
            "error": result.get('error', 'An unknown error occurred')
        }), 400

@app.route('/api/resources/import', methods=['POST'])
def import_resources():
    """
    API endpoint to import resources from Excel file
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
        
    if not file.filename.endswith('.xlsx'):
        return jsonify({"error": "File must be an Excel file (.xlsx)"}), 400

    try:
        # Read Excel file
        df = pd.read_excel(file, engine='openpyxl')
        
        # For debugging: Print first few rows
        print("DEBUG - First 2 rows of Excel data:")
        print(df.head(2))
        
        # Expected columns
        required_columns = ["inventoryNum", "title", "author", "editor", "ISBN", "price", 
                          "cote", "receivingDate", "status", "observation", "type", "description"]
        
        # Check if all required columns are present
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return jsonify({"error": f"Missing columns: {', '.join(missing_columns)}"}), 400

        # Map text values to integers for status and type
        status_map = {
            "Available": 1,
            "Unavailable": 0,
            "available": 1,
            "unavailable": 0,
        }

        success_count = 0
        errors = []

        # Process each row
        for index, row in df.iterrows():
            try:
                # Convert status from text to integer if needed
                if isinstance(row["status"], str):
                    if row["status"] in status_map:
                        status_value = status_map[row["status"]]
                    else:
                        raise ValueError(f"Invalid status: {row['status']}. Expected: Available or Unavailable")
                else:
                    status_value = int(row["status"])
                    
                # Convert type to integer if it's not already
                if isinstance(row["type"], str):
                    # Try to convert it directly if it's a number in string form
                    try:
                        type_value = int(row["type"])
                    except ValueError:
                        # If conversion fails, add error message with hint about using type IDs
                        errors.append(f"Row {index + 2}: Type must be a resource type ID number, not a text name")
                        continue
                else:
                    type_value = int(row["type"])
                
                # Handle price properly - make sure it's a clean integer without decimal
                price_raw = row["price"]
                try:
                    price_value = int(float(price_raw)) if price_raw else 0
                except ValueError:
                    errors.append(f"Row {index + 2}: Invalid price format: {price_raw}")
                    continue
                
                resource_data = {
                    "r_inventoryNum": str(row["inventoryNum"]),
                    "r_title": str(row["title"]),
                    "r_author": str(row["author"]),
                    "r_editor": str(row["editor"]),
                    "r_edition": str(row["edition"]),
                    "r_resume": str(row["resume"]),
                    "r_ISBN": str(row["ISBN"]),
                    "r_price": price_value,  # Using the cleaned price value
                    "r_cote": str(row["cote"]),
                    "r_receivingDate": str(row["receivingDate"]),
                    "r_status": status_value,
                    "r_observation": str(row["observation"]),
                    "r_type": type_value,
                    "r_description": str(row["description"])
                }
                
                print(f"DEBUG - Adding resource: {resource_data}")
                result = add_resource(resource_data)
                if result.get('success'):
                    success_count += 1
                else:
                    errors.append(f"Row {index + 2}: {result.get('error', 'Unknown error')}")
            
            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")
                print(f"Exception for row {index + 2}: {str(e)}")

        return jsonify({
            "message": f"Import completed. Successfully imported {success_count} resources.",
            "errors": errors if errors else None,
            "success": True
        }), 200 if not errors else 207  # 207 Multi-Status if there were some errors

    except Exception as e:
        print(f"Global error in import: {str(e)}")
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500

@app.route('/api/resource-history', methods=['GET'])
def get_resource_history_route():
    """
    API endpoint to retrieve the history of a resource
    """
    try:
        resource_id = request.args.get('resource_id')
        print(f"Received request for resource history with resource_id: {resource_id}")
        
        if not resource_id:
            print("Error: No resource_id provided")
            return jsonify({'error': 'Resource ID is required'}), 400

        try:
            resource_id = int(resource_id)
        except ValueError:
            print("Error: Invalid resource_id format")
            return jsonify({'error': 'Resource ID must be a number'}), 400

        print(f"Fetching history for resource {resource_id}")
        history = get_resource_history(resource_id)
        print(f"Retrieved history data: {history}")
        
        return jsonify(history)

    except Exception as e:
        print(f"Error in get_resource_history route: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/comments', methods=['POST'])
def create_comment():
    try:
        data = request.json
        if not data:
            return jsonify({'success':False, 'error':'No data'}),400
        required_fields = ['userId','resourceId','comment','rating','date']
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
    
        if missing_fields:
            return jsonify({'success': False, 'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        result = add_comment(data)
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
    except Exception as e:
        print(' error in add comment route')
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/comments/<int:resource_id>', methods=['GET'])
def get_comment(resource_id):
    try:
        result = get_comments(resource_id)
        
        if hasattr(result, 'data') and result.data:
            return jsonify(result.data), 200
        else:
            return jsonify({'message': 'No comments found'}), 404
    except Exception as e:
        print('Error in get comment route:', e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/resources/<int:resource_id>/comments', methods=['GET'])
@jwt_required()
def get_resource_comments(resource_id):
    """
    API endpoint to get comments and ratings for a specific resource
    """
    try:
        comments = get_comments(resource_id)
        # Ensure comments is a list of dictionaries
        if not isinstance(comments, list):
            comments = []
        return jsonify({
            'success': True,
            'comments': comments
        }), 200
    except Exception as e:
        print(f"Error in get_resource_comments: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/report', methods=['POST'])
def create_report():
    try:
        data = request.json
        if not data:
            return jsonify({'success':False, 'error':'No data'}),400
        required_fields = ['reporter_id','comment_id','reason']
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
    
        if missing_fields:
            return jsonify({'success': False, 'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        result = add_report(data)
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
    except Exception as e:
        print(' error in report comment route')
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments/<int:resource_id>/reports', methods=['GET'])
@jwt_required()
def get_comment_reports(resource_id):
    """
    API endpoint to get reports for comments on a specific resource
    """
    try:
        # Get all comments for the resource
        comments = get_comments(resource_id)
        if not comments:
            return jsonify({'reports': []}), 200

        # Get all reports for these comments
        comment_ids = [comment['rat_id'] for comment in comments]
        response = supabase \
            .from_('comment_report') \
            .select('*') \
            .in_('comment_id', comment_ids) \
            .execute()

        return jsonify({
            'success': True,
            'reports': response.data or []
        }), 200
    except Exception as e:
        print(f"Error in get_comment_reports: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment_endpoint(comment_id):
    """
    API endpoint to delete a comment
    """
    try:
        result = delete_comment(comment_id)
        return jsonify(result), (200 if result['success'] else 400)
    except Exception as e:
        print(f"Error in delete_comment_endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/comments/report', methods=['POST', 'OPTIONS'])
@jwt_required()
def report_comment_route():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        reporter_id = data.get('reporter_id')
        comment_id = data.get('comment_id')
        reason = data.get('reason')

        if not all([reporter_id, comment_id, reason]):
            print(f"Missing required fields: reporter_id={reporter_id}, comment_id={comment_id}, reason={reason}")
            return jsonify({'error': 'Missing required fields'}), 400

        result = add_report({
            'reporter_id': reporter_id,
            'comment_id': comment_id,
            'reason': reason
        })
        return jsonify(result), 200
    except Exception as e:
        print(f"Error in report_comment_route: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/<int:report_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def delete_report_endpoint(report_id):
    """
    API endpoint to delete a report by ID.
    """
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        user_email = get_jwt_identity()
        result = delete_report(report_id)
        return jsonify(result), (200 if result.get('success') else 400)
    except Exception as e:
        print(f"Error deleting report: {str(e)}")
        return jsonify({'error': str(e)}), 500
