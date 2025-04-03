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
        
        # Then get all users with that user_type
        user_response = supabase.from_("User").select("u_id, u_name, u_email, u_birthDate, u_phone, u_type").execute()
        
        # Transform the response to a simpler format
        readers = [{
            'id': user['u_id'],
            'name': user['u_name'],
            'email': user['u_email'],
            'birthDate': user['u_birthDate'],
            'phone': user['u_phone'],
            'type': user['u_type']
        } for user in user_response.data]
        
        return readers
    except Exception as e:
        print(f"Error fetching readers: {e}")
        return []

def get_user_types():
    try:
        
        # Then get all users with that user_type
        user_response = supabase.from_("User_type").select("ut_id, ut_name, ut_borrow").execute()
        
        # Transform the response to a simpler format
        types = [{
            'id': user_type['ut_id'],
            'name': user_type['ut_name'],
            'borrow': user_type['ut_name'],
        } for user_type in user_response.data]
        
        return types
    except Exception as e:
        print(f"Error fetching readers: {e}")
        return []

def add_reader(reader_data):
    """
    Add a new reader to the database.
    :param reader_data: Dictionary containing reader details.
    """
    try:
        # Check if u_type is already an ID or needs to be looked up
        if isinstance(reader_data.get('u_type'), dict) and 'id' in reader_data['u_type']:
            # If u_type is an object with an id property, use that ID
            reader_type_id = reader_data['u_type']['id']
        elif isinstance(reader_data.get('u_type'), (int, str)):
            # If u_type is already an ID (int or string), use it directly
            reader_type_id = reader_data['u_type']
        else:
            return {'success': False, 'error': "Invalid user type provided"}

        # Add user with the reader type
        reader_data['u_type'] = reader_type_id  # Assign reader type ID
        
        # Remove any password field if it exists (should be handled by auth)
        if 'u_password' in reader_data:
            del reader_data['u_password']
            
        response = supabase.from_("User").insert(reader_data).execute()

        if response.data:
            return {'success': True, 'reader': response.data[0]}
        else:
            return {'success': False, 'error': 'Failed to add reader'}
    except Exception as e:
        print(f"Error adding reader: {e}")
        return {'success': False, 'error': str(e)}


def delete_reader(reader_id):
    """
    Delete a reader from the database by their user ID.
    :param reader_id: The ID of the reader to delete.
    """
    try:
        response = supabase.from_("User").delete().eq("u_id", reader_id).execute()

        if response.data:
            return {'success': True, 'message': 'Reader deleted successfully'}
        else:
            return {'success': False, 'error': 'Reader not found or could not be deleted'}
    except Exception as e:
        print(f"Error deleting reader: {e}")
        return {'success': False, 'error': str(e)}


def get_transactions():
    """
    Retrieve all reservations (transactions) from the database, 
    joining with User and Resource tables for borrower name and book title.
    """
    try:
        response = supabase.from_("Reservation").select(
            "res_id, res_status, "
            "User(u_id, u_name), "
            "Resource(r_id, r_title)"
        ).execute()

        if not response.data:
            return []

        transactions = [{
            'id': transaction['res_id'],
            'borrower_name': transaction['User']['u_name'],  # Using email as identifier
            'title': transaction['Resource']['r_title'],
            'type': "Reservation",  # Assuming all are reservations
            'date': "N/A"  # Add actual date if available
        } for transaction in response.data]

        return transactions
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        return []


def get_resources():
    """
    Retrieve all resources (books) from the database.
    """
    try:
        response = supabase.from_("Resource").select(
            "r_id,r_inventoryNum, r_title, r_author, r_editor, r_ISBN, r_price, r_cote, r_receivingDate, r_status, r_observation, r_type"
        ).execute()

        resources = [{
            'id': resource['r_id'],
            'inventoryNum': resource['r_inventoryNum'],
            'title': resource['r_title'],
            'author': resource['r_author'],
            'editor': resource['r_editor'],
            'isbn': resource['r_ISBN'],
            'price': resource['r_price'],
            'cote': resource['r_cote'],
            'receivingDate': resource['r_receivingDate'],
            'status': resource['r_status'],
            'observation': resource['r_observation'],
            'type': resource['r_type']
        } for resource in response.data]

        return resources
    except Exception as e:
        print(f"Error fetching resources: {e}")
        return []

def get_resource_types():
    """
    Retrieve all resource types from the database.
    """
    try:
        response = supabase.from_("Resource_type").select("rt_id, rt_name").execute()

        resource_types = [{
            'id': resource_type['rt_id'],
            'name': resource_type['rt_name']
        } for resource_type in response.data]

        return resource_types
    except Exception as e:
        print(f"Error fetching resource types: {e}")
        return []

def add_resource(resource_data):
    """
    Add a new resource (book) to the database.
    :param resource_data: Dictionary containing resource details.
    """
    try:
        response = supabase.from_("Resource").insert(resource_data).execute()

        if response.data:
            return {
                'success': True,
                'resource': response.data[0]
            }
        else:
            return {
                'success': False,
                'error': 'Failed to add resource'
            }
    except Exception as e:
        print(f"Error adding resource: {e}")
        return {
            'success': False,
            'error': str(e)
        }

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