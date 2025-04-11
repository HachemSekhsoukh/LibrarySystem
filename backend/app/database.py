import os
from supabase import create_client
from dotenv import load_dotenv
import datetime
from werkzeug.security import generate_password_hash, check_password_hash


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
            'borrow': user_type['ut_borrow'],
        } for user_type in user_response.data]
        
        return types
    except Exception as e:
        print(f"Error fetching readers: {e}")
        return []

def add_user_type(user_type_data):
    """
    Add a new user type to the database.
    :param user_type_data: Dictionary containing user type details.
    """
    try:
        response = supabase.from_("User_type").insert(user_type_data).execute()

        if response.data:
            return {'success': True, 'user_type': response.data[0]}
        else:
            return {'success': False, 'error': 'Failed to add user type'}
    except Exception as e:
        print(f"Error adding user type: {e}")
        return {'success': False, 'error': str(e)}

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
            "res_id, res_status, res_date,"
            "User(u_id, u_name), "
            "Resource(r_id, r_title)"
        ).execute()

        if not response.data:
            return []
        
        status_map = {
            1:"Borrow",  # You can adjust these status codes based on your needs
            2:"Return",
            3:"Renew"
        }
        transactions = [{
            'id': transaction['res_id'],
            'borrower_name': transaction['User']['u_name'],  # Using email as identifier
            'title': transaction['Resource']['r_title'],
            'type': status_map.get(transaction['res_status']),  # Assuming all are reservations
            'date': transaction['res_date']  # Add actual date if available
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
        response = supabase.from_("Resource_type").select("rt_id, rt_name, rt_borrow").execute()

        resource_types = [{
            'id': resource_type['rt_id'],
            'name': resource_type['rt_name'],
            'borrow': resource_type['rt_borrow']
        } for resource_type in response.data]

        return resource_types
    except Exception as e:
        print(f"Error fetching resource types: {e}")
        return []


def add_resource_type(resource_type_data):
    """
    Add a new resource type to the database.
    :param resource_type_data: Dictionary containing resource type details.
    """
    try:
        response = supabase.from_("Resource_type").insert(resource_type_data).execute()

        if response.data:
            return {'success': True, 'resource_type': response.data[0]}
        else:
            return {'success': False, 'error': 'Failed to add resource type'}
    except Exception as e:
        print(f"Error adding resource type: {e}")
        return {'success': False, 'error': str(e)}

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
    
def login(email, password):
    """
    Log in a staff user by verifying credentials from the Staff table.
    Uses hashed password comparison.
    """
    try:
        # Fetch only email and hashed password
        response = supabase \
            .from_("Staff") \
            .select("s_id, s_email, s_name, s_password") \
            .eq("s_email", email) \
            .execute()

        if response.data and len(response.data) > 0:
            staff = response.data[0]
            stored_hashed_password = staff["s_password"]

            if check_password_hash(stored_hashed_password, password):
                return {
                    'success': True,
                    'user': {
                        'id': staff['s_id'],
                        'email': staff['s_email'],
                        'name': staff.get('s_name')
                    }
                }
            else:
                return {'success': False, 'error': 'Invalid email or password'}
        else:
            return {'success': False, 'error': 'Invalid email or password'}

    except Exception as e:
        print(f"Error logging in: {e}")
        return {'success': False, 'error': str(e)}

def sign_up(email, password, name=None):
    """
    Register a new staff user by inserting into the Staff table.
    """
    try:
        # Check if user already exists
        existing = supabase.from_("Staff").select("s_id").eq("s_email", email).execute()
        if existing.data and len(existing.data) > 0:
            return {'success': False, 'error': 'Email already exists'}

        # Insert new user
        new_user = {
            's_email': email,
            's_password': password
        }

        if name:
            new_user['s_name'] = name

        response = supabase.from_("Staff").insert(new_user).execute()

        if response.data:
            return {
                'success': True,
                'user': {
                    'id': response.data[0]['s_id'],
                    'email': response.data[0]['s_email']
                }
            }
        else:
            return {'success': False, 'error': 'Failed to sign up'}
    except Exception as e:
        print(f"Error signing up: {e}")
        return {'success': False, 'error': str(e)}


def get_user_by_email(email):
    """
    Fetch a user's public profile details from the Staff table using email.
    """
    try:
        response = supabase \
            .from_("Staff") \
            .select("s_name, s_email, s_phone, s_birthdate, s_address") \
            .eq("s_email", email) \
            .limit(1) \
            .execute()

        if response.data and len(response.data) > 0:
            user = response.data[0]
            return {
                'name': user.get('s_name'),
                'email': user.get('s_email'),
                'phone': user.get('s_phone'),
                'birthdate': user.get('s_birthdate'),
                'address': user.get('s_address')
            }
        else:
            return None

    except Exception as e:
        print(f"Error fetching user by email: {e}")
        return None

def update_user_by_email(email, fields):
    """
    Update a user's profile details in the Staff table using their email.
    Only updates fields provided in the `fields` dictionary.
    """
    try:
        # Map internal keys to Supabase column names
        supabase_fields = {}
        for key, value in fields.items():
            if key == 'name':
                supabase_fields['s_name'] = value
            elif key == 'birthdate':
                supabase_fields['s_birthdate'] = value
            elif key == 'address':
                supabase_fields['s_address'] = value
            elif key == 'phone':
                supabase_fields['s_phone'] = value  # optional

        if not supabase_fields:
            return False  # Nothing valid to update

        response = supabase \
            .from_("Staff") \
            .update(supabase_fields) \
            .eq("s_email", email) \
            .execute()

        if response.status_code == 200:
            return True
        else:
            print(f"Supabase update failed: {response}")
            return False

    except Exception as e:
        print(f"Error updating user by email: {e}")
        return False
    
def update_user_password(user_email, new_password):
    """
    Update the user's password in the Supabase database.
    """

    try:
        # Hash the new password before storing it
        hashed_password = generate_password_hash(new_password)

        # Prepare the data to update
        update_fields = {'s_password': hashed_password}

        if not update_fields:
            return False  # No valid fields to update

        # Make the update request to Supabase
        response = supabase \
            .from_("Staff") \
            .update(update_fields) \
            .eq("s_email", user_email) \
            .execute()

        # Check the response status
        if response.status_code == 200:
            return True
        else:
            print(f"Supabase update failed: {response}")
            return False

    except Exception as e:
        print(f"Error updating password for user {user_email}: {e}")
        return False
    
def get_user_password(email):
    """
    Fetch the user's password from the Supabase database using their email.
    Returns the password if found, otherwise returns None.
    """
    try:
        # Fetch the user from the "Staff" table by email
        response = supabase \
            .from_("Staff") \
            .select("s_password") \
            .eq("s_email", email) \
            .execute()

        if response.data:
            # Return the password field (assuming it's under the alias "s_password")
            print(response.data[0]["s_password"])
            return response.data[0]["s_password"]
        else:
            print(f"User not found for email {email} or query failed.")
            return None

    except Exception as e:
        print(f"Error fetching user password by email: {e}")
        return None
    

def hash_all_passwords():
    response = supabase.from_("Staff").select("s_email", "s_password").execute()
    users = response.data

    for user in users:
        plain_password = user["s_password"]
        hashed_password = generate_password_hash(plain_password)
        supabase.from_("Staff").update({"s_password": hashed_password}).eq("s_email", user["s_email"]).execute()

    print("All passwords hashed.")

def get_all_staff_members():
    try:
        response = supabase \
        .from_("Staff") \
        .select("s_id, s_name, s_email,s_phone,s_birthdate, s_address") \
        .execute()

        if response.data:
            return response.data
        return []
    except Exception as e:
        print(f"Error fetching staff members: {e}")
        return []
    
def add_staff_member(data):
    """
    Add a new staff member to the Staff table.
    Checks for existing email before inserting.
    Expects `data` to be a dictionary with keys:
    'email', 'password', 'name', 'phone', 'address', 'bdate', 'type'.
    """
    try:
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        phone = data.get('phone')
        address = data.get('address')
        bdate = data.get('bdate')
        s_type = data.get('type')

        if not email or not password:
            return {'success': False, 'error': 'Email and password are required'}

        # Check if user already exists
        existing = supabase.from_("Staff").select("s_id").eq("s_email", email).execute()
        if existing.data and len(existing.data) > 0:
            return {'success': False, 'error': 'Email already exists'}

        # Build new staff object
        new_staff = {
            's_email': email,
            's_password': password,
            's_name': name,
            's_phone': phone,
            's_address': address,
            's_birthdate': bdate,
            's_type': s_type
        }

        # Insert into Staff table
        response = supabase.from_("Staff").insert(new_staff).execute()

        if response.data:
            return {
                'success': True,
                'user': {
                    'id': response.data[0]['s_id'],
                    'email': response.data[0]['s_email']
                }
            }
        else:
            return {'success': False, 'error': 'Failed to add staff member'}

    except Exception as e:
        print(f"Error adding staff member: {e}")
        return {'success': False, 'error': str(e)}

def add_staff_member(data):
    """
    Add a new staff member to the Staff table.
    Checks for existing email before inserting.
    Expects `data` to be a dictionary with keys:
    'email', 'password', 'name', 'phone', 'address', 'bdate', 'type'.
    """
    try:
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        phone = data.get('phone')
        address = data.get('address')
        bdate = data.get('birthdate')
        s_type = data.get('type')

        if not email or not password:
            return {'success': False, 'error': 'Email and password are required'}, 400

        # Check if user already exists
        existing = supabase.from_("Staff").select("s_id").eq("s_email", email).execute()
        if existing.data and len(existing.data) > 0:
            return {'success': False, 'error': 'Email already exists'}, 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Build new staff object
        new_staff = {
            's_email': email,
            's_password': hashed_password,
            's_name': name,
            's_phone': phone,
            's_address': address,
            's_birthdate': bdate,
            's_type': s_type
        }

        # Insert into Staff table
        response = supabase.from_("Staff").insert(new_staff).execute()

        if response.data:
            return {
                'success': True,
                'user': {
                    'id': response.data[0]['s_id'],
                    'email': response.data[0]['s_email']
                }
            }, 201  # HTTP 201 for created

        else:
            return {'success': False, 'error': 'Failed to add staff member'}, 500

    except Exception as e:
        print(f"Error adding staff member: {e}")
        return {'success': False, 'error': str(e)}, 500