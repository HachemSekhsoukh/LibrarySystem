import os
from supabase import create_client
from dotenv import load_dotenv
import datetime

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

def get_readers():
    """
    Retrieve all users with user_type 'reader' from the database by joining User and User_type tables
    """
    try:
        # First, get the user_type ID for 'reader'
        type_response = supabase.from_("User_type").select("ut_id").eq("ut_name", "reader").execute()
        
        if not type_response.data:
            print("Reader user type not found")
            return []
            
        reader_type_id = type_response.data[0]['ut_id']
        
        # Then get all users with that user_type
        user_response = supabase.from_("User").select("u_id, u_name, u_email").eq("u_type", reader_type_id).execute()
        
        # Transform the response to a simpler format
        readers = [{
            'id': user['u_id'],
            'name': user['u_name'],
            'email': user['u_email']
        } for user in user_response.data]
        
        return readers
    except Exception as e:
        print(f"Error fetching readers: {e}")
        return []

def get_resources():
    """
    Retrieve all resources (books) from the database
    """
    try:
        response = supabase.from_("Resource").select("r_id, r_title, r_author, r_ISBN").execute()
        
        # Transform the response to a simpler format
        resources = [{
            'id': resource['r_id'],
            'title': resource['r_title'],
            'author': resource['r_author'],
            'isbn': resource['r_ISBN']
        } for resource in response.data]
        
        return resources
    except Exception as e:
        print(f"Error fetching resources: {e}")
        return []

def create_transaction(reader_id, book_id, transaction_type='Borrow'):
    """
    Create a new transaction (exemplaire) in the database
    """
    try:
        # Create transaction data
        transaction_data = {
            'reader_id': reader_id,
            'book_id': book_id,
            'transaction_type': transaction_type,
            'transaction_date': datetime.datetime.now().isoformat()
        }
        
        # Insert into the transactions table
        # Note: Replace 'transactions' with your actual table name
        response = supabase.from_("transactions").insert(transaction_data).execute()
        
        if response.data:
            return {
                'success': True,
                'transaction': response.data[0]
            }
        else:
            return {
                'success': False,
                'error': 'Failed to create transaction'
            }
    except Exception as e:
        print(f"Error creating transaction: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def create_reservation(user_id, resource_id, transaction_type):
    """
    Create a new reservation in the database
    """
    try:
        # First, get the latest res_id to increment it
        latest_res = supabase.from_("Reservation").select("res_id").order("res_id", desc=True).limit(1).execute()
        
        # Calculate new res_id
        new_res_id = 1  # Default if no existing reservations
        if latest_res.data and len(latest_res.data) > 0:
            new_res_id = latest_res.data[0]['res_id'] + 1

        # Map transaction types to status codes
        status_map = {
            "Borrow": 1,  # You can adjust these status codes based on your needs
            "Return": 2,
            "Renew": 3
        }

        # Create reservation data
        reservation_data = {
            'res_id': new_res_id,
            'res_user_id': user_id,
            'res_resource_id': resource_id,
            'res_staff_id': None,  # Setting to None as requested
            'res_status': status_map.get(transaction_type, 1)  # Default to 1 if type not found
        }
        
        # Insert into the Reservation table
        response = supabase.from_("Reservation").insert(reservation_data).execute()
        
        if response.data:
            return {
                'success': True,
                'reservation': response.data[0]
            }
        else:
            return {
                'success': False,
                'error': 'Failed to create reservation'
            }
    except Exception as e:
        print(f"Error creating reservation: {e}")
        return {
            'success': False,
            'error': str(e)
        } 