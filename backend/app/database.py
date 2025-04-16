import os
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime
import calendar
from werkzeug.security import generate_password_hash, check_password_hash


# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

def get_readers_by_status(status=1):
    """
    Retrieve readers with the given u_status from the database.
    u_status: 1 for verified, 0 for pending
    """
    try:
        user_response = (
            supabase
            .from_("User")
            .select("u_id, u_name, u_email, u_birthDate, u_phone, User_type (ut_name), u_status")
            .eq("u_status", status)
            .execute()
        )
        
        readers = [{
            'id': user['u_id'],
            'name': user['u_name'],
            'email': user['u_email'],
            'birthDate': user['u_birthDate'],
            'phone': user['u_phone'],
            'type': user['User_type']['ut_name'] if user.get('User_type') else 'No type',
            'status': user['u_status']
        } for user in user_response.data]
        
        return readers

    except Exception as e:
        print(f"Error fetching readers with status {status}: {e}")
        return []
    

def get_readers():
    """
    Retrieve all users with user_type 'reader' from the database by joining User and User_type tables
    """
    try:
        
        # Then get all users with that user_type
        user_response = supabase.from_("User").select("""u_id, u_name, u_email, u_birthDate, u_phone, User_type (ut_name)""").execute()

        
        # Transform the response to a simpler format
        readers = [{
            'id': user['u_id'],
            'name': user['u_name'],
            'email': user['u_email'],
            'birthDate': user['u_birthDate'],
            'phone': user['u_phone'],
            'type': user['User_type']['ut_name']
        } for user in user_response.data]
        
        return readers
    except Exception as e:
        print(f"Error fetching readers: {e}")
        return []
    
def update_reader_status_in_db(reader_id, new_status):
    try:
        response = (
            supabase
            .from_("User")
            .update({'u_status': new_status})
            .eq('u_id', reader_id)
            .execute()
        )
        print("Supabase update response:", response)

        # Only return 400 if there's a real error message
        if hasattr(response, 'error') and response.error:
            return {'success': False, 'error': str(response.error)}
        
        return {'success': True, 'message': 'Reader status updated successfully.'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

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

def delete_user_type(user_type_id):
    """
    Delete a user type from the database by its ID.
    :param user_type_id: The ID of the user type to delete.
    """
    try:
        response = supabase.from_("User_type").delete().eq("ut_id", user_type_id).execute()

        if response.data:
            return {'success': True, 'message': 'User type deleted successfully'}
        else:
            return {'success': False, 'error': 'User type not found or could not be deleted'}
    except Exception as e:
        print(f"Error deleting user type: {e}")
        return {'success': False, 'error': str(e)}

def update_user_type(user_type_id, user_type_data):
    """
    Update a user type in the database.
    :param user_type_id: The ID of the user type to update.
    :param user_type_data: Dictionary containing updated user type details.
    """
    try:
        response = supabase.from_("User_type").update(user_type_data).eq("ut_id", user_type_id).execute()

        if response.data:
            return {
                'success': True,
                'user_type': response.data[0],
                'message': 'User type updated successfully'
            }
        else:
            return {
                'success': False,
                'error': 'User type not found or could not be updated'
            }
    except Exception as e:
        print(f"Error updating user type: {e}")
        return {
            'success': False,
            'error': str(e)
        }

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
            "r_id,r_inventoryNum, r_title, r_author, r_editor, r_ISBN, r_price, r_cote, r_receivingDate, r_status, r_num_of_borrows,r_observation,r_description,r_type, "
            "Resource_type(rt_name)"
        ).execute()
        status_map = {
            0:"Not Available",
            1:"Available",
        }
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
            'numofborrows': resource['r_num_of_borrows'],
            'observation': resource['r_observation'],
            'type': resource['r_type'],
            'description': resource['r_description'],
            'type_name': resource['Resource_type']['rt_name'] if resource.get('Resource_type') else None,
            'status_name': status_map.get(resource['r_status'], "Unknown")  # Map status to name
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

def delete_resource_type(resource_type_id):
    """
    Delete a resource type from the database by its ID.
    :param resource_type_id: The ID of the resource type to delete.
    """
    try:
        response = supabase.from_("Resource_type").delete().eq("rt_id", resource_type_id).execute()

        if response.data:
            return {'success': True, 'message': 'Resource type deleted successfully'}
        else:
            return {'success': False, 'error': 'Resource type not found or could not be deleted'}
    except Exception as e:
        print(f"Error deleting resource type: {e}")
        return {'success': False, 'error': str(e)}

def update_resource_type(resource_type_id, resource_type_data):
    """
    Update a resource type in the database.
    :param resource_type_id: The ID of the resource type to update.
    :param resource_type_data: Dictionary containing updated resource type details.
    """
    try:
        response = supabase.from_("Resource_type").update(resource_type_data).eq("rt_id", resource_type_id).execute()

        if response.data:
            return {
                'success': True,
                'resource_type': response.data[0],
                'message': 'Resource type updated successfully'
            }
        else:
            return {
                'success': False,
                'error': 'Resource type not found or could not be updated'
            }
    except Exception as e:
        print(f"Error updating resource type: {e}")
        return {
            'success': False,
            'error': str(e)
        }

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

def delete_resource(resource_id):
    """
    Delete a resource from the database by its ID.
    :param resource_id: The ID of the resource to delete.
    """
    try:
        response = supabase.from_("Resource").delete().eq("r_id", resource_id).execute()

        if response.data:
            return {'success': True, 'message': 'Resource deleted successfully'}
        else:
            return {'success': False, 'error': 'Resource not found or could not be deleted'}
    except Exception as e:
        print(f"Error deleting resource: {e}")
        return {'success': False, 'error': str(e)}

def update_resource(resource_id, resource_data):
    """
    Update a resource in the database.
    :param resource_id: The ID of the resource to update.
    :param resource_data: Dictionary containing updated resource details.
    """
    try:
        response = supabase.from_("Resource").update(resource_data).eq("r_id", resource_id).execute()

        if response.data:
            return {
                'success': True,
                'resource': response.data[0],
                'message': 'Resource updated successfully'
            }
        else:
            return {
                'success': False,
                'error': 'Resource not found or could not be updated'
            }
    except Exception as e:
        print(f"Error updating resource: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def create_reservation(user_id, resource_id, transaction_type):
    """
    Create a new reservation in the database and increment the
    number of borrows for the resource in the Resource table.
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
            # If the transaction type is "Borrow", increment the r_num_of_borrows in the Resource table
            if transaction_type == "Borrow":
                # Fetch the current number of borrows for the resource
                resource_data = supabase.from_("Resource").select("r_num_of_borrows").eq('r_id', resource_id).execute()

                if resource_data.data and len(resource_data.data) > 0:
                    current_borrows = resource_data.data[0]['r_num_of_borrows']

                    # Increment the borrow count
                    updated_borrows = current_borrows + 1

                    # Update the resource with the new borrow count
                    update_response = supabase.from_("Resource").update(
                        {'r_num_of_borrows': updated_borrows}
                    ).eq('r_id', resource_id).execute()

                    if update_response.data:
                        return {
                            'success': True,
                            'reservation': response.data[0],
                            'message': 'Reservation created and borrow count updated successfully'
                        }
                    else:
                        return {
                            'success': False,
                            'error': 'Failed to update borrow count in Resource table'
                        }
                else:
                    return {
                        'success': False,
                        'error': 'Failed to fetch resource data'
                    }
            else:
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
    
def login_student(email, password):
    """
    Log in a student by verifying credentials from the User table.
    Uses hashed password comparison.
    """
    try:
        # Fetch only email and hashed password
        response = supabase \
            .from_("User") \
            .select("u_id, u_email, u_name, u_password") \
            .eq("u_email", email) \
            .execute()

        if response.data and len(response.data) > 0:
            student = response.data[0]
            stored_hashed_password = student["u_password"]

            if check_password_hash(stored_hashed_password, password):
                return {
                    'success': True,
                    'user': {
                        'id': student['u_id'],
                        'email': student['u_email'],
                        'name': student.get('u_name')
                    }
                }
            else:
                return {'success': False, 'error': 'Invalid email or password'}
        else:
            return {'success': False, 'error': 'Invalid email or password'}

    except Exception as e:
        print(f"Error logging in student: {e}")
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
    
def sign_up_student(email, password, name=None):
    """
    Register a new student user by inserting into the User table.
    """
    try:
        # Check if student already exists
        existing = supabase.from_("User").select("u_id").eq("u_email", email).execute()
        if existing.data and len(existing.data) > 0:
            return {'success': False, 'error': 'Email already exists'}

        # Hash the password before storing
        hashed_password = generate_password_hash(password)

        # Prepare new user data
        new_user = {
            'u_email': email,
            'u_password': hashed_password
        }

        if name:
            new_user['u_name'] = name

        # Insert new user
        response = supabase.from_("User").insert(new_user).execute()

        if response.data:
            return {
                'success': True,
                'user': {
                    'id': response.data[0]['u_id'],
                    'email': response.data[0]['u_email']
                }
            }
        else:
            return {'success': False, 'error': 'Failed to sign up'}
    except Exception as e:
        print(f"Error signing up student: {e}")
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
    
def get_student_by_email(email):
    """
    Fetch a student's public profile details from the User table using email.
    """
    try:
        response = supabase \
            .from_("User") \
            .select("u_name, u_email, u_phone, u_birthdate") \
            .eq("u_email", email) \
            .limit(1) \
            .execute()

        if response.data and len(response.data) > 0:
            user = response.data[0]
            return {
                'name': user.get('u_name'),
                'email': user.get('u_email'),
                'phone': user.get('u_phone'),
                'birthdate': user.get('u_birthdate')
            }
        else:
            return None

    except Exception as e:
        print(f"Error fetching student by email: {e}")
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
    
def update_student_by_email(email, fields):
    """
    Update a student's profile details in the User table using their email.
    Only updates fields provided in the `fields` dictionary.
    """
    try:
        # Map internal keys to Supabase column names
        supabase_fields = {}
        for key, value in fields.items():
            if key == 'name':
                supabase_fields['u_name'] = value
            elif key == 'birthdate':
                supabase_fields['u_birthDate'] = value
            elif key == 'address':
                supabase_fields['u_address'] = value
            elif key == 'phone':
                supabase_fields['u_phone'] = value  # optional

        if not supabase_fields:
            return False  # Nothing valid to update

        response = supabase \
            .from_("User") \
            .update(supabase_fields) \
            .eq("u_email", email) \
            .execute()

        if response.status_code == 200:
            return True
        else:
            print(f"Supabase update failed: {response}")
            return False

    except Exception as e:
        print(f"Error updating student by email: {e}")
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

def update_student_password(user_email, new_password):
    """
    Update the student's password in the Supabase database.
    """
    try:
        # Hash the new password before storing it
        hashed_password = generate_password_hash(new_password)

        update_fields = {'u_password': hashed_password}

        response = supabase \
            .from_("User") \
            .update(update_fields) \
            .eq("u_email", user_email) \
            .execute()

        if response.status_code == 200:
            return True
        else:
            print(f"Supabase update failed: {response}")
            return False

    except Exception as e:
        print(f"Error updating student password for {user_email}: {e}")
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

def get_student_password(email):
    """
    Fetch the student's password from the Supabase database using their email.
    Returns the hashed password if found, otherwise returns None.
    """
    try:
        response = supabase \
            .from_("User") \
            .select("u_password") \
            .eq("u_email", email) \
            .execute()

        if response.data:
            print(response.data[0]["u_password"])
            return response.data[0]["u_password"]
        else:
            print(f"Student not found for email {email} or query failed.")
            return None

    except Exception as e:
        print(f"Error fetching student password by email: {e}")
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
        .select("s_id, s_name, s_email,s_phone,s_birthdate, s_address, s_type") \
        .execute()

        if response.data:
            return response.data
        return []
    except Exception as e:
        print(f"Error fetching staff members: {e}")
        return []


def get_staff_types():
    """
    Retrieve all staff types from the database.
    """
    try:
        response = supabase.from_("Staff_type").select("st_id, st_name").execute()

        resource_types = [{
            'id': resource_type['st_id'],
            'name': resource_type['st_name']
        } for resource_type in response.data]

        return resource_types
    except Exception as e:
        print(f"Error fetching resource types: {e}")
        return []


def add_staff_type(staff_type_data):
    """
    Add a new staff type to the database.
    :param staff_type_data: Dictionary containing staff type details.
    """
    try:
        response = supabase.from_("Staff_type").insert(staff_type_data).execute()

        if response.data:
            return {'success': True, 'staff_type': response.data[0]}
        else:
            return {'success': False, 'error': 'Failed to add staff type'}
    except Exception as e:
        print(f"Error adding staff type: {e}")
        return {'success': False, 'error': str(e)}

def delete_staff_type(staff_type_id):
    """
    Delete a staff type from the database by its ID.
    :param staff_type_id: The ID of the staff type to delete.
    """
    try:
        response = supabase.from_("Staff_type").delete().eq("st_id", staff_type_id).execute()

        if response.data:
            return {'success': True, 'message': 'Staff type deleted successfully'}
        else:
            return {'success': False, 'error': 'Staff type not found or could not be deleted'}
    except Exception as e:
        print(f"Error deleting staff type: {e}")
        return {'success': False, 'error': str(e)}

def update_staff_type(staff_type_id, staff_type_data):
    """
    Update a staff type in the database.
    :param staff_type_id: The ID of the staff type to update.
    :param staff_type_data: Dictionary containing updated staff type details.
    """
    try:
        response = supabase.from_("Staff_type").update(staff_type_data).eq("st_id", staff_type_id).execute()

        if response.data:
            return {
                'success': True,
                'staff_type': response.data[0],
                'message': 'Staff type updated successfully'
            }
        else:
            return {
                'success': False,
                'error': 'Staff type not found or could not be updated'
            }
    except Exception as e:
        print(f"Error updating staff type: {e}")
        return {
            'success': False,
            'error': str(e)
        }


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
        s_type = data.get('staff_type_id')

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
    
def get_total_users():
    try:
        response = supabase.from_("User").select("u_id", count="exact").execute()
        return response.count or 0
    except Exception as e:
        print(f"Error getting total users: {e}")
        return 0

def get_total_resources():
    try:
        response = supabase.from_("Resource").select("r_id", count="exact").execute()
        return response.count or 0
    except Exception as e:
        print(f"Error getting total resources: {e}")
        return 0

def get_total_reservations():
    try:
        response = supabase.from_("Reservation").select("res_id", count="exact").execute()
        return response.count or 0
    except Exception as e:
        print(f"Error getting total reservations: {e}")
        return 0

def get_monthly_reservations():
    try:
        now = datetime.now()
        first_day = now.replace(day=1).date().isoformat()
        last_day = now.replace(day=calendar.monthrange(now.year, now.month)[1]).date().isoformat()

        response = supabase.from_("Reservation") \
            .select("res_id", count="exact") \
            .gte("res_date", first_day) \
            .lte("res_date", last_day) \
            .execute()

        return response.count or 0
    except Exception as e:
        print(f"Error getting monthly reservations: {e}")
        return 0

def get_stats():
    try:
        return {
            'total_users': get_total_users(),
            'total_resources': get_total_resources(),
            'total_reservations': get_total_reservations(),
            'monthly_borrows': get_monthly_reservations()
        }
    except Exception as e:
        print(f"Error fetching dashboard stats: {e}")
        return {
            'total_users': 0,
            'total_resources': 0,
            'total_reservations': 0,
            'monthly_borrows': 0
        }
    
def get_monthly_borrows():
    try:
        response = supabase.table("Reservation").select("res_id, res_date").execute()

        borrow_counts = {}

        for row in response.data:
            res_date = row.get("res_date")
            if res_date:
                date = datetime.fromisoformat(res_date.replace("Z", "+00:00"))
                month = date.strftime("%b")  # 'Jan', 'Feb', ...
                borrow_counts[month] = borrow_counts.get(month, 0) + 1

        # Return months in calendar order
        ordered_months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return [{"month": m, "borrows": borrow_counts.get(m, 0)} for m in ordered_months]

    except Exception as e:
        print("Database error in get_monthly_borrows:", e)
        return []

def update_reservation(reservation_id, user_id=None, resource_id=None, transaction_type=None):
    """
    Update an existing reservation in the database
    :param reservation_id: The ID of the reservation to update
    :param user_id: The new user ID (borrower)
    :param resource_id: The new resource ID
    :param transaction_type: The new transaction type
    """
    try:
        # Map transaction types to status codes if provided
        update_data = {}
        
        if user_id is not None:
            update_data['res_user_id'] = user_id
            
        if resource_id is not None:
            update_data['res_resource_id'] = resource_id
            
        if transaction_type is not None:
            status_map = {
                "Borrow": 1,
                "Return": 2,
                "Renew": 3
            }
            update_data['res_status'] = status_map.get(transaction_type, 1)
        
        # Only update if we have data to update
        if not update_data:
            return {
                'success': False,
                'error': 'No update data provided'
            }
            
        # Update the reservation
        response = supabase.from_("Reservation").update(update_data).eq("res_id", reservation_id).execute()
        
        if response.data:
            return {
                'success': True,
                'reservation': response.data[0],
                'message': 'Reservation updated successfully'
            }
        else:
            return {
                'success': False,
                'error': 'Reservation not found or could not be updated'
            }
    except Exception as e:
        print(f"Error updating reservation: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def delete_reservation(reservation_id):
    """
    Delete a reservation from the database
    :param reservation_id: The ID of the reservation to delete
    """
    try:
        # Delete the reservation
        response = supabase.from_("Reservation").delete().eq("res_id", reservation_id).execute()
        
        # If data is returned, it means the deletion was successful
        if response.data:
            return {
                'success': True,
                'message': 'Reservation deleted successfully'
            }
        else:
            return {
                'success': False,
                'error': 'Reservation not found or could not be deleted'
            }
    except Exception as e:
        print(f"Error deleting reservation: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def update_reader(reader_id, reader_data):
    """
    Update a reader's information in the database.
    :param reader_id: The ID of the reader to update.
    :param reader_data: Dictionary containing the updated reader details.
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

        # Assign reader type ID
        reader_data['u_type'] = reader_type_id
        
        # If password is empty, remove it from the update data
        if 'u_password' in reader_data and not reader_data['u_password']:
            del reader_data['u_password']
        
        # Update the reader in the database
        response = supabase.from_("User").update(reader_data).eq("u_id", reader_id).execute()
        
        if response.data:
            return {'success': True, 'reader': response.data[0]}
        else:
            return {'success': False, 'error': 'Reader not found or could not be updated'}
    except Exception as e:
        print(f"Error updating reader: {e}")
        return {'success': False, 'error': str(e)}


def get_most_borrowed_resources(limit=5):
    """
    Fetch the most borrowed resources from the Resource table.
    Returns a list of dictionaries with resource info sorted by r_num_of_borrows.
    """
    try:
        response = supabase.table("Resource") \
            .select("r_id,r_author ,r_title, r_cote, r_type, r_num_of_borrows") \
            .order("r_num_of_borrows", desc=True) \
            .limit(limit) \
            .execute()
        print(response)

        if response.data:
            return response.data
        else:
            return []
    except Exception as e:
        print("Error fetching most borrowed resources:", e)
        return []
