import os
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime, timedelta
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
        user_response = supabase.from_("User_type").select("ut_id, ut_name, ut_borrow, ut_books, ut_renew").execute()
        
        # Transform the response to a simpler format
        types = [{
            'id': user_type['ut_id'],
            'name': user_type['ut_name'],
            'borrow': user_type['ut_borrow'],
            'ut_books': user_type['ut_books'],
            'ut_renew': user_type['ut_renew']
        } for user_type in user_response.data]
        
        return types
    except Exception as e:
        print(f"Error fetching readers: {e}")
        return []

def add_user_type(user_email, user_type_data):
    """
    Add a new user type to the database.
    :param user_type_data: Dictionary containing user type details.
    """
    try:
        response = supabase.from_("User_type").insert(user_type_data).execute()

        if response.data:
            add_log(user_email,f"added a user type: {user_type_data['ut_name']}")
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

def add_reader(user_email,reader_data):
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
        reader_data['u_password'] = generate_password_hash(reader_data['u_password'] )
        reader_data['u_type'] = reader_type_id  # Assign reader type ID
            
        response = supabase.from_("User").insert(reader_data).execute()

        if response.data:
            add_log(user_email, f"added a new reader with name: {reader_data['u_name']}")
            return {'success': True, 'reader': response.data[0]}
        else:
            return {'success': False, 'error': 'Failed to add reader'}
    except Exception as e:
        print(f"Error adding reader: {e}")
        return {'success': False, 'error': str(e)}


def delete_reader(user_email,reader_id):
    """
    Delete a reader from the database by their user ID.
    :param reader_id: The ID of the reader to delete.
    """
    try:
        response = supabase.from_("User").delete().eq("u_id", reader_id).execute()

        if response.data:
            add_log(user_email, f"deleted a reader with ID: {reader_id}")
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
            "res_id, res_type, res_date,"
            "User(u_id, u_name), "
            "Resource(r_id, r_title)"
        ).execute()

        if not response.data:
            return []
        
        type_map = {
            1: "Borrow",
            2: "Return",
            3: "Renew_1",
            4: "Late",
            5: "Renew_2"
        }
        transactions = [{
            'id': transaction['res_id'],
            'borrower_name': transaction['User']['u_name'],  # Using email as identifier
            'title': transaction['Resource']['r_title'],
            'type': type_map.get(transaction['res_type']),  # Assuming all are reservations
            'date': transaction['res_date']  # Add actual date if available
        } for transaction in response.data]

        return transactions
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        return []

def get_transactions_by_user(user_id):
    """
    Retrieve all transactions for a specific user by their user ID.
    """
    try:
        response = supabase.from_("Reservation").select(
            "res_id, res_type, res_date,"
            "Resource(r_id, r_title)"
        ).eq("res_user_id", user_id).execute()

        return response.data
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        return []

def get_resources():
    """
    Retrieve all resources (books) from the database.
    """
    try:
        response = supabase.from_("Resource").select(
            "r_id,r_inventoryNum, r_title, r_author, r_editor, r_ISBN, r_price, r_cote,r_edition, r_resume, r_receivingDate, r_status, r_num_of_borrows,r_observation,r_description,r_type,cover_url, "
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
            'edition': resource['r_edition'],
            'resume': resource['r_resume'],
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
            'status_name': status_map.get(resource['r_status'], "Unknown"),
            'image_url' :  resource['cover_url'],
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


def add_resource_type(user_email,resource_type_data):
    """
    Add a new resource type to the database.
    :param resource_type_data: Dictionary containing resource type details.
    """
    try:
        response = supabase.from_("Resource_type").insert(resource_type_data).execute()

        if response.data:
            add_log(user_email, f"added a resource type: {resource_type_data['rt_name']}")
            return {'success': True, 'resource_type': response.data[0]}
        else:
            return {'success': False, 'error': 'Failed to add resource type'}
    except Exception as e:
        print(f"Error adding resource type: {e}")
        return {'success': False, 'error': str(e)}

def delete_resource_type(user_email,resource_type_id):
    """
    Delete a resource type from the database by its ID.
    :param resource_type_id: The ID of the resource type to delete.
    """
    try:
        response = supabase.from_("Resource_type").delete().eq("rt_id", resource_type_id).execute()

        if response.data:
            add_log(user_email, f"deleted a resource type with id: {resource_type_id}")
            return {'success': True, 'message': 'Resource type deleted successfully'}
        else:
            return {'success': False, 'error': 'Resource type not found or could not be deleted'}
    except Exception as e:
        print(f"Error deleting resource type: {e}")
        return {'success': False, 'error': str(e)}

def update_resource_type(user_email,resource_type_id, resource_type_data):
    """
    Update a resource type in the database.
    :param resource_type_id: The ID of the resource type to update.
    :param resource_type_data: Dictionary containing updated resource type details.
    """
    try:
        response = supabase.from_("Resource_type").update(resource_type_data).eq("rt_id", resource_type_id).execute()

        if response.data:
            add_log(user_email, f"updated a resource type, id: {resource_type_id}, data: {resource_type_data['rt_name'], resource_type_data['rt_borrow']}")
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

def add_resource(user_email,resource_data):
    """
    Add a new resource (book) to the database.
    :param resource_data: Dictionary containing resource details.
    """
    try:
        response = supabase.from_("Resource").insert(resource_data).execute()

        if response.data:
            add_log(user_email, f"added a resource with: title: {resource_data['r_title']}, author: {resource_data['r_author']}")
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

def delete_resource(user_email,resource_id):
    """
    Delete a resource from the database by its ID.
    :param resource_id: The ID of the resource to delete.
    """
    try:
        response = supabase.from_("Resource").delete().eq("r_id", resource_id).execute()

        if response.data:
            add_log(user_email, f"deleted a resource with id: {resource_id}")
            return {'success': True, 'message': 'Resource deleted successfully'}
        else:
            return {'success': False, 'error': 'Resource not found or could not be deleted'}
    except Exception as e:
        print(f"Error deleting resource: {e}")
        return {'success': False, 'error': str(e)}

def update_resource(user_email,resource_id, resource_data):
    """
    Update a resource in the database.
    :param resource_id: The ID of the resource to update.
    :param resource_data: Dictionary containing updated resource details.
    """
    try:
        response = supabase.from_("Resource").update(resource_data).eq("r_id", resource_id).execute()

        if response.data:
            add_log(user_email, f"updated a resource with id: {resource_id}, title: {resource_data['r_title']}, author: {resource_data['r_author']}, ISBN: {resource_data['r_ISBN']}")
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

def create_reservation(user_email, user_id, resource_id, transaction_type):
    """
    Create a new reservation in the database and increment the
    number of borrows for the resource in the Resource table.
    """
    try:
        # Check reservation/borrow limit
        user_type = supabase.from_("User").select("u_type, User_type(ut_books)").eq("u_id", user_id).single().execute().data
        ut_books = user_type['User_type']['ut_books'] if user_type and user_type.get('User_type') else 0
        active_statuses = [1, 3, 5]  # Borrow, Renew_1, Renew_2
        active_count = supabase.from_("Reservation").select("res_id").eq("res_user_id", user_id).in_("res_type", active_statuses).execute()
        if ut_books and active_count.data and len(active_count.data) >= ut_books:
            return {'success': False, 'error': f'User has reached the maximum allowed active reservations/borrows ({ut_books})'}

        # First, get the latest res_id to increment it
        latest_res = supabase.from_("Reservation").select("res_id").order("res_id", desc=True).limit(1).execute()
        
        # Calculate new res_id
        new_res_id = 1  # Default if no existing reservations
        if latest_res.data and len(latest_res.data) > 0:
            new_res_id = latest_res.data[0]['res_id'] + 1

        # Map transaction types to types codes
        type_map = {
            "Borrow": 1,
            "Return": 2,
            "Renew_1": 3,
            "Late": 4,
            "Renew_2": 5
        }

        # Create reservation data
        from datetime import datetime
        reservation_data = {
            'res_id': new_res_id,
            'res_user_id': user_id,
            'res_resource_id': resource_id,
            'res_staff_id': None,
            'res_type': type_map.get(transaction_type, 1),
            'res_date': datetime.now().strftime('%Y-%m-%d') 
        }
        
        # Print the reservation data before insert
        print("Reservation data to insert:", reservation_data)
        
        # Insert into the Reservation table
        response = supabase.from_("Reservation").insert(reservation_data).execute()
        if transaction_type == "Borrow" or transaction_type == "Renew_1":
            update_resource_status(resource_id, 0)
        if transaction_type == "Return":
            update_resource_status(resource_id, 1)
        
        if response.data:
            # Log reservation creation
            add_log(user_email, f"created a transaction of type: {transaction_type} for resource ID: {resource_id} for user ID: {user_id}")

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


def update_resource_status(resource_id, status):
    """
    Update the status of a resource in the database.
    """
    try:
        response = supabase.from_("Resource").update({'r_status': status}).eq('r_id', resource_id).execute()
        return response.data
    except Exception as e:
        print(f"Error updating resource status: {e}")
        return None
    
def login(email, password):
    """
    Log in a staff user by verifying credentials from the Staff table.
    Uses hashed password comparison.
    Adds a login log on successful login.
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
                # Successful login, add a log using add_log
                if add_log(staff['s_email'], "logged in successfully."):
                    return {
                        'success': True,
                        'user': {
                            'id': staff['s_id'],
                            'email': staff['s_email'],
                            'name': staff.get('s_name')
                        }
                    }
                else:
                    return {'success': False, 'error': 'Failed to log login event'}

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
    
def sign_up_student(email, password, name, birthdate, phone, user_type):
    """
    Register a new student user by inserting into the User table.
    All fields are required.
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
            'u_password': hashed_password,
            'u_name': name,
            'u_birthDate': birthdate,
            'u_phone': phone,
            'u_type': user_type
        }

        # Insert new user
        response = supabase.from_("User").insert(new_user).execute()

        if response.data:
            return {
                'success': True,
                'user': {
                    'id': response.data[0]['u_id'],
                    'email': response.data[0]['u_email'],
                    'name': response.data[0]['u_name'],
                    'birthdate': response.data[0].get('u_birthdate', None),
                    'phone': response.data[0].get('u_phone', None),
                    'user_type': response.data[0].get('u_type', None)
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
            .select("s_id, s_name, s_email, s_phone, s_birthdate, s_address, s_type") \
            .eq("s_email", email) \
            .limit(1) \
            .execute()

        if response.data and len(response.data) > 0:
            user = response.data[0]
            return {
                'id': user.get('s_id'),
                'name': user.get('s_name'),
                'email': user.get('s_email'),
                'phone': user.get('s_phone'),
                'birthdate': user.get('s_birthdate'),
                'address': user.get('s_address'),
                'type': user.get('s_type')
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
            .select("u_id, u_name, u_email, u_phone, u_birthDate, u_type, u_status") \
            .eq("u_email", email) \
            .limit(1) \
            .execute()


        if response.data and len(response.data) > 0:
            user = response.data[0]
            return {
                'id': user.get('u_id'),
                'name': user.get('u_name'),
                'email': user.get('u_email'),
                'phone': user.get('u_phone'),
                'birthdate': user.get('u_birthDate'),
                'type': user.get('u_type'),
                'status': user.get('u_status')
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
    Adds a log when the update is successful.
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

        if response.data:  # If there's returned data, update was successful
            # Successful update, now insert a log
            try:
                user = get_user_by_email(email)
                if user:
                    supabase \
                        .from_("Logs") \
                        .insert({
                            's_id': user['id'],
                            'message': f"User {user['email']} updated their profile."
                        }) \
                        .execute()
            except Exception as log_error:
                print(f"Failed to insert update log: {log_error}")

            return True
        else:
            print(f"Supabase update failed: No data returned.")
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
    Adds a log when the password is successfully updated.
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

        # Check if update was successful
        if response.data:
            try:
                add_log(user_email, f"user changed their password.")
            except Exception as log_error:
                print(f"Failed to insert password change log: {log_error}")

            return True
        else:
            print(f"Supabase update failed: No data returned.")
            return False

    except Exception as e:
        print(f"Error updating password for user {user_email}: {e}")
        return False

def update_student_password_db(user_email, new_password):
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

def get_login_attempts_db(email):
    response = supabase.from_("User").select("login_attempt_count, blocked_until").eq("u_email", email).execute()
    print("response");
    print(response);
    if response.data and len(response.data) > 0:
        return response.data[0]
    return None

def update_login_attempts_db(email, login_attempt_count, blocked_until):
    print("blocked")
    print(blocked_until);
    
    response = supabase.from_("User").update({"login_attempt_count": login_attempt_count, "blocked_until": blocked_until}).eq("u_email", email).execute()
    return response.data

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


def add_staff_type(user_email, staff_type_data):
    """
    Add a new staff type to the database.
    :param staff_type_data: Dictionary containing staff type details.
    """
    try:
        response = supabase.from_("Staff_type").insert(staff_type_data).execute()

        if response.data:
            # Log the staff type creation
            type_name = staff_type_data.get('st_name', 'Unknown')
            add_log(user_email, f"added a new staff type: {type_name}")

            return {'success': True, 'staff_type': response.data[0]}
        else:
            return {'success': False, 'error': 'Failed to add staff type'}
    except Exception as e:
        print(f"Error adding staff type: {e}")
        return {'success': False, 'error': str(e)}


def delete_staff_type(user_email, staff_type_id):
    """
    Delete a staff type from the database by its ID.
    :param user_email: Email of the user performing the deletion
    :param staff_type_id: The ID of the staff type to delete.
    """
    try:
        print(f"Attempting to delete staff type {staff_type_id}")
        
        # First check if the staff type exists
        existing = supabase.from_("Staff_type").select("st_id, st_name").eq("st_id", staff_type_id).execute()
        if not existing.data or len(existing.data) == 0:
            print(f"Staff type {staff_type_id} not found")
            return {'success': False, 'error': 'Staff type not found'}

        # First delete all associated privileges
        try:
            # Try both possible table names
            try:
                delete_priv_response = supabase.from_("staff_type_privileges").delete().eq("staff_type_id", staff_type_id).execute()
                print(f"Deleted associated privileges from staff_type_privileges: {delete_priv_response}")
            except Exception as e1:
                print(f"First attempt failed: {str(e1)}")
                try:
                    delete_priv_response = supabase.from_("Staff_type_privileges").delete().eq("staff_type_id", staff_type_id).execute()
                    print(f"Deleted associated privileges from Staff_type_privileges: {delete_priv_response}")
                except Exception as e2:
                    print(f"Second attempt failed: {str(e2)}")
                    raise Exception("Failed to delete privileges from both table names")

        except Exception as priv_error:
            print(f"Error deleting privileges: {str(priv_error)}")
            return {'success': False, 'error': f'Failed to delete associated privileges: {str(priv_error)}'}

        # Then delete the staff type
        response = supabase.from_("Staff_type").delete().eq("st_id", staff_type_id).execute()
        print(f"Delete response: {response}")

        # In Supabase, a successful delete operation returns an empty array
        if response.data is not None:
            # Log the deletion
            add_log(user_email, f"deleted staff type with ID: {staff_type_id}")
            return {'success': True, 'message': 'Staff type deleted successfully'}
        else:
            print(f"Failed to delete staff type {staff_type_id}: {response.error if hasattr(response, 'error') else 'Unknown error'}")
            return {'success': False, 'error': 'Failed to delete staff type'}
    except Exception as e:
        print(f"Error deleting staff type: {str(e)}")
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

def add_staff_member(user_email, data):
    """
    Add a new staff member to the Staff table.
    Checks for existing email before inserting.
    Expects `data` to be a dictionary with keys:
    'email', 'password', 'name', 'phone', 'address', 'birthdate', 'staff_type_id'.
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
            # Log the staff creation
            add_log(user_email, f"added a new staff member with email: {email}")
            
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
        # Fetch current reservation
        current = supabase.from_("Reservation").select("res_type").eq("res_id", reservation_id).single().execute().data
        if not current:
            return {'success': False, 'error': 'Reservation not found'}
        current_type = current['res_type']
        # Allowed transitions
        allowed = {
            0: [1],  # Reservation (if 0) → Borrow
            1: [3, 2, 4],  # Borrow → Renew_1, Return, Late
            3: [5, 2, 4],  # Renew_1 → Renew_2, Return, Late
            5: [2, 4],     # Renew_2 → Return, Late
            4: [2],        # Late → Return
        }
        type_map = {"Borrow": 1, "Return": 2, "Renew_1": 3, "Late": 4, "Renew_2": 5}
        new_type = type_map.get(transaction_type, 1)
        if current_type not in allowed or new_type not in allowed[current_type]:
            return {'success': False, 'error': 'Invalid status transition'}

        print(f"\nUpdating reservation {reservation_id}")
        print(f"Transaction type: {transaction_type}")
        
        # Map transaction types to status codes if provided
        update_data = {}
        
        if user_id is not None:
            update_data['res_user_id'] = user_id
            
        if resource_id is not None:
            update_data['res_resource_id'] = resource_id
            
        if transaction_type is not None:
            type_map = {
                "Borrow": 1,
                "Return": 2,
                "Renew_1": 3,
                "Late": 4,
                "Renew_2": 5
            }
            update_data['res_type'] = type_map.get(transaction_type, 1)
            print(f"Mapped transaction type to: {update_data['res_type']}")
        
        # Only update if we have data to update
        if not update_data:
            return {
                'success': False,
                'error': 'No update data provided'
            }
            
        # Update the reservation
        print("Updating reservation with data:", update_data)
        response = supabase.from_("Reservation").update(update_data).eq("res_id", reservation_id).execute()
        print("Update response:", response.data)
        
        if response.data:
            # If the new type is "Return" (2), delete the reservation
            if transaction_type == "Return":
                print(f"Attempting to delete reservation {reservation_id}")
                delete_response = supabase.from_("Reservation").delete().eq("res_id", reservation_id).execute()
                print("Delete response:", delete_response)
                
                if delete_response.data is not None:  # Changed condition to check for None
                    print("Successfully deleted reservation")
                    return {
                        'success': True,
                        'message': 'Reservation marked as returned and deleted successfully'
                    }
                else:
                    print("Failed to delete reservation")
                    return {
                        'success': False,
                        'error': 'Failed to delete returned reservation'
                    }
            
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

def update_reader(user_email,reader_id, reader_data):
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
        reader_data['u_password'] = generate_password_hash(reader_data['u_password'] )
        reader_data['u_type'] = reader_type_id
        
        # If password is empty, remove it from the update data
        if 'u_password' in reader_data and not reader_data['u_password']:
            del reader_data['u_password']
        
        # Update the reader in the database
        response = supabase.from_("User").update(reader_data).eq("u_id", reader_id).execute()
        
        if response.data:
            add_log(user_email, f"edited a reader with ID: {reader_id}")
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

def get_reader_history(user_id):
    """
    Get the complete history of a reader including reservations, borrows, and returns.
    Also calculates due dates based on resource type borrow limits or user type limits.
    """
    try:
        print(f"\nFetching history for user_id: {user_id}")
        user_response = supabase.from_("User") \
            .select("u_type, User_type(ut_borrow, ut_renew)") \
            .eq("u_id", user_id) \
            .single() \
            .execute()
        user_type_borrow_limit = user_response.data.get('User_type', {}).get('ut_borrow') if user_response.data else None
        user_type_renew = user_response.data.get('User_type', {}).get('ut_renew') if user_response.data else None
        response = supabase.from_("History") \
            .select("h_id, h_resource_id, h_user_id, h_status, h_date, h_res_id, " \
                   "Resource(r_title, r_type, Resource_type(rt_borrow))") \
            .eq("h_user_id", user_id) \
            .order("h_date", desc=True) \
            .execute()
        if not response.data:
            return []
        resources = {}
        for record in response.data:
            resource_id = record['h_resource_id']
            if resource_id not in resources:
                resources[resource_id] = {
                    'resource_id': resource_id,
                    'document_title': record['Resource']['r_title'] if record.get('Resource') else 'Unknown Resource',
                    'reservation_date': None,
                    'borrow_date': None,
                    'due_date': None,
                    'return_date': None,
                    'status': 'Unknown'
                }
            rt_borrow = record.get('Resource', {}).get('Resource_type', {}).get('rt_borrow')
            borrow_limit = rt_borrow if rt_borrow and rt_borrow > 1 else user_type_borrow_limit
            if record['h_status'] == 0:  # Reservation
                resources[resource_id]['reservation_date'] = record['h_date']
                resources[resource_id]['status'] = 'Reserved'
            elif record['h_status'] == 1:  # Borrow
                resources[resource_id]['borrow_date'] = record['h_date']
                if borrow_limit:
                    due_date = datetime.fromisoformat(record['h_date'].replace('Z', '+00:00')) + timedelta(days=borrow_limit)
                    resources[resource_id]['due_date'] = due_date.isoformat()
                resources[resource_id]['status'] = 'Borrowed'
            elif record['h_status'] == 3:  # Renew_1
                resources[resource_id]['borrow_date'] = record['h_date']
                if borrow_limit and user_type_renew:
                    due_date = datetime.fromisoformat(record['h_date'].replace('Z', '+00:00')) + timedelta(days=borrow_limit + user_type_renew)
                    resources[resource_id]['due_date'] = due_date.isoformat()
                resources[resource_id]['status'] = 'Renew_1'
            elif record['h_status'] == 5:  # Renew_2
                resources[resource_id]['borrow_date'] = record['h_date']
                if borrow_limit and user_type_renew:
                    due_date = datetime.fromisoformat(record['h_date'].replace('Z', '+00:00')) + timedelta(days=borrow_limit + 2 * user_type_renew)
                    resources[resource_id]['due_date'] = due_date.isoformat()
                resources[resource_id]['status'] = 'Renew_2'
            elif record['h_status'] == 2:  # Return
                resources[resource_id]['return_date'] = record['h_date']
                resources[resource_id]['status'] = 'Returned'
            elif record['h_status'] == 4:  # Late
                resources[resource_id]['status'] = 'Late'
        processed_history = list(resources.values())
        processed_history.sort(key=lambda x: x['borrow_date'] or x['reservation_date'] or x['return_date'], reverse=True)
        return processed_history
    except Exception as e:
        print(f"Error in get_reader_history: {str(e)}")
        raise

def get_resource_history(resource_id):
    """
    Get the complete history of a resource including all reservations, borrows, and returns.
    """
    try:
        history_query = supabase.table('History') \
            .select('*') \
            .eq('h_resource_id', resource_id) \
            .order('h_date', desc=True) \
            .execute()
        if not history_query.data:
            return []
        interactions = {}
        for record in history_query.data:
            user_id = record['h_user_id']
            key = f"{user_id}_{record['h_date']}"
            user_details = get_user_details(user_id)
            borrower_name = user_details['u_name'] if user_details and user_details.get('u_name') else 'Unknown User'
            if key not in interactions:
                interactions[key] = {
                    'borrower_name': borrower_name,
                    'reservation_date': None,
                    'borrow_date': None,
                    'due_date': None,
                    'return_date': None,
                    'status': 'Unknown'
                }
            else:
                interactions[key]['borrower_name'] = borrower_name
            # Fetch user and resource type info for each record
            user = supabase.from_("User").select("u_type, User_type(ut_borrow, ut_renew)").eq("u_id", user_id).single().execute().data
            user_type_borrow_limit = user['User_type']['ut_borrow'] if user and user.get('User_type') else None
            user_type_renew = user['User_type']['ut_renew'] if user and user.get('User_type') else None
            resource = supabase.from_("Resource").select("r_type, Resource_type(rt_borrow)").eq("r_id", record['h_resource_id']).single().execute().data
            rt_borrow = resource.get('Resource_type', {}).get('rt_borrow') if resource else None
            borrow_limit = rt_borrow if rt_borrow and rt_borrow > 1 else user_type_borrow_limit
            if record['h_status'] == 0:
                interactions[key]['reservation_date'] = record['h_date']
                interactions[key]['status'] = 'Reserved'
            elif record['h_status'] == 1:
                interactions[key]['borrow_date'] = record['h_date']
                if borrow_limit:
                    due_date = datetime.fromisoformat(record['h_date'].replace('Z', '+00:00')) + timedelta(days=borrow_limit)
                    interactions[key]['due_date'] = due_date.isoformat()
                interactions[key]['status'] = 'Borrowed'
            elif record['h_status'] == 3:
                interactions[key]['borrow_date'] = record['h_date']
                if borrow_limit and user_type_renew:
                    due_date = datetime.fromisoformat(record['h_date'].replace('Z', '+00:00')) + timedelta(days=borrow_limit + user_type_renew)
                    interactions[key]['due_date'] = due_date.isoformat()
                interactions[key]['status'] = 'Renew_1'
            elif record['h_status'] == 5:
                interactions[key]['borrow_date'] = record['h_date']
                if borrow_limit and user_type_renew:
                    due_date = datetime.fromisoformat(record['h_date'].replace('Z', '+00:00')) + timedelta(days=borrow_limit + 2 * user_type_renew)
                    interactions[key]['due_date'] = due_date.isoformat()
                interactions[key]['status'] = 'Renew_2'
            elif record['h_status'] == 2:
                interactions[key]['return_date'] = record['h_date']
                interactions[key]['status'] = 'Returned'
            elif record['h_status'] == 4:
                interactions[key]['status'] = 'Late'
        result = list(interactions.values())
        result.sort(key=lambda x: x['borrow_date'] or x['reservation_date'] or x['return_date'], reverse=True)
        return result
    except Exception as e:
        print(f"Error in get_resource_history: {str(e)}")
        return {'error': str(e)}

def add_log(email, message):
    """
    Add a log entry for a staff user based on their email and a message.
    """
    try:
        user = get_user_by_email(email)
        if user:
            s_id = user['id']
            response = supabase \
                .from_("Logs") \
                .insert({
                    's_id': s_id,
                    'message': message
                }) \
                .execute()
            return True
        else:
            print("User not found. Cannot insert log.")
            return False
    except Exception as e:
        print(f"Error inserting log: {e}")
        return False
    
def get_user_email_by_id(staff_id):
    """
    Fetch the email of a user based on their staff ID.
    Returns the email or None if not found.
    """
    try:
        response = supabase \
            .from_("Staff") \
            .select("s_email") \
            .eq("s_id", staff_id) \
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]['s_email']
        else:
            return None
    except Exception as e:
        print(f"Error fetching email for staff ID {staff_id}: {e}")
        return None


def get_logs():
    """
    Fetch logs from the Logs table.
    Returns a list of logs with added staff email or an empty list if none found.
    """
    try:
        response = supabase \
            .from_("Logs") \
            .select("id, message, created_at, s_id") \
            .order("created_at", desc=True) \
            .limit(15) \
            .execute()

        logs = []
        
        if response.data:
            for log in response.data:
                staff_email = get_user_email_by_id(log['s_id'])  # Get email for staff ID
                log['staff_email'] = staff_email  # Add email to the log entry
                logs.append(log)
        
        return logs if logs else []
    except Exception as e:
        print(f"Error fetching logs: {e}")
        return []


def assign_privileges_to_user_type(staff_type_id, privilege_labels):
    try:
        # Fetch privilege IDs matching the given labels
        priv_query = supabase.table('privileges')\
            .select('id, name')\
            .in_('name', privilege_labels)\
            .execute()

        if not priv_query.data:
            return {'success': False, 'error': "no priveleges sent to endpoint"}

        privilege_id_map = {row['name']: row['id'] for row in priv_query.data}
        missing = [label for label in privilege_labels if label not in privilege_id_map]

        if missing:
            return {'success': False, 'error': f"Unknown privileges: {', '.join(missing)}"}

        privilege_ids = list(privilege_id_map.values())

        # Delete old privileges
        delete_result = supabase.table('staff_type_privileges')\
            .delete().eq('staff_type_id', staff_type_id).execute()

        # Insert new privileges
        new_entries = [{'staff_type_id': staff_type_id, 'privilege_id': pid} for pid in privilege_ids]

        insert_result = supabase.table('staff_type_privileges')\
            .insert(new_entries).execute()

        # Check if insert was successful
        if not insert_result.data:
            return {'success': False, 'error': ""}

        return {'success': True, 'message': 'Privileges assigned successfully'}

    except Exception as e:
        return {'success': False, 'error': str(e)}
    
def get_user_privileges(email):
    """
    Fetches user privileges based on their user type using Supabase.
    Returns a list of privilege objects or an empty list if not found.
    """
    try:
        # Get the user object
        user = get_user_by_email(email)
        if not user:
            return []

        user_type_id = user.get('type')
        if not user_type_id:
            return []

        # Fetch privileges associated with the user_type_id
        response = supabase \
            .from_('staff_type_privileges') \
            .select('privileges(id, name)') \
            .eq('staff_type_id', user_type_id) \
            .execute()

        if not response.data:
            return []

        # Extract privilege objects
        privileges = [entry['privileges']['name'] for entry in response.data if 'privileges' in entry]
        return privileges

    except Exception as e:
        print(f"Error fetching user privileges: {str(e)}")
        return []

def delete_staff_member(user_email, staff_id):
    """
    Delete a staff member from the database by their ID.
    :param user_email: Email of the user performing the deletion
    :param staff_id: The ID of the staff member to delete
    """
    try:
        # First check if the staff member exists
        existing = supabase.from_("Staff").select("s_id, s_email").eq("s_id", staff_id).execute()
        if not existing.data or len(existing.data) == 0:
            return {'success': False, 'error': 'Staff member not found'}

        # Delete the staff member
        response = supabase.from_("Staff").delete().eq("s_id", staff_id).execute()

        if response.data:
            # Log the deletion
            add_log(user_email, f"deleted staff member with ID: {staff_id}")
            return {'success': True, 'message': 'Staff member deleted successfully'}
        else:
            return {'success': False, 'error': 'Failed to delete staff member'}
    except Exception as e:
        print(f"Error deleting staff member: {e}")
        return {'success': False, 'error': str(e)}

def update_staff_member(user_email, staff_id, staff_data):
    """
    Update a staff member in the database.
    :param user_email: Email of the user performing the update
    :param staff_id: The ID of the staff member to update
    :param staff_data: Dictionary containing updated staff details
    """
    try:
        # First check if the staff member exists
        existing = supabase.from_("Staff").select("s_id").eq("s_id", staff_id).execute()
        if not existing.data or len(existing.data) == 0:
            return {'success': False, 'error': 'Staff member not found'}

        # If password is provided, hash it
        if 'password' in staff_data and staff_data['password']:
            staff_data['s_password'] = generate_password_hash(staff_data['password'])
            del staff_data['password']

        # Map the input fields to database fields
        update_data = {
            's_name': staff_data.get('name'),
            's_email': staff_data.get('email'),
            's_phone': staff_data.get('phone'),
            's_address': staff_data.get('address'),
            's_birthdate': staff_data.get('birthdate'),
            's_type': staff_data.get('staff_type_id')
        }

        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}

        # Update the staff member
        response = supabase.from_("Staff").update(update_data).eq("s_id", staff_id).execute()

        if response.data:
            # Log the update
            add_log(user_email, f"updated staff member with ID: {staff_id}")
            return {
                'success': True,
                'message': 'Staff member updated successfully'
            }
        else:
            return {'success': False, 'error': 'Failed to update staff member'}
    except Exception as e:
        print(f"Error updating staff member: {e}")
        return {'success': False, 'error': str(e)}


def get_transaction_details(transaction_id):
    """
    Get detailed information about a specific transaction by ID.
    Includes information needed for late return notifications.
    
    Args:
        transaction_id (int): The ID of the transaction
        
    Returns:
        dict: Transaction details including user_id, title, and due_date
    """
    try:
        response = supabase.from_("Reservation").select(
            "res_id, res_type, res_date, res_user_id, "
            "Resource(r_id, r_title)"
        ).eq("res_id", transaction_id).execute()

        if not response.data or len(response.data) == 0:
            return None
            
        transaction = response.data[0]
        
        # Get the user's type to determine borrow limit
        user_response = supabase.from_("User") \
            .select("u_type, User_type(ut_borrow)") \
            .eq("u_id", transaction["res_user_id"]) \
            .single() \
            .execute()
        
        user_type_borrow_limit = user_response.data.get('User_type', {}).get('ut_borrow') if user_response.data else None
        
        # Get the resource's type to determine borrow limit
        resource_response = supabase.from_("Resource") \
            .select("r_type, Resource_type(rt_borrow)") \
            .eq("r_id", transaction["Resource"]["r_id"]) \
            .single() \
            .execute()
            
        resource_type_borrow_limit = resource_response.data.get('Resource_type', {}).get('rt_borrow') if resource_response.data else None
        
        # Use resource type limit first, then fall back to user type limit
        borrow_limit = resource_type_borrow_limit or user_type_borrow_limit or 14  # Default to 14 days if no limit specified
        
        # Calculate due date based on reservation date and borrow limit
        from datetime import datetime, timedelta
        res_date = datetime.fromisoformat(transaction["res_date"].replace('Z', '+00:00'))
        due_date = res_date + timedelta(days=borrow_limit)
        
        return {
            'id': transaction['res_id'],
            'user_id': transaction['res_user_id'],
            'title': transaction['Resource']['r_title'],
            'due_date': due_date.isoformat()
        }
        
    except Exception as e:
        print(f"Error fetching transaction details: {e}")
        return None

def get_user_details(user_id):
    """
    Get user details for a specific user ID
    
    Args:
        user_id (int): The ID of the user
        
    Returns:
        dict: User details including email and name
    """
    try:
        response = supabase.from_("User") \
            .select("u_id, u_name, u_email, u_phone") \
            .eq("u_id", user_id) \
            .single() \
            .execute()
            
        if not response.data:
            return None
            
        user = response.data
        
        return {
            'u_id': user.get('u_id'),
            'u_name': user.get('u_name'),
            'u_email': user.get('u_email'),
            'u_phone': user.get('u_phone')
        }
        
    except Exception as e:
        print(f"Error fetching user details: {e}")
        return None

    

def add_comment(data):
    try:
        user = data.get('userId')
        resource = data.get('resourceId')
        comment = data.get('comment')
        rating = data.get('rating')
        date = data.get('date')
        response = supabase \
                    .from_("Rating") \
                    .insert({
                        'user_id': user,
                        'res_id': resource,
                        'comment':comment,
                        'rating':rating,
                        'rat_date':date
                    }) \
                    .execute()
        if response.data:
            return {'success': True}
        else:
            return {'success': False, 'error':'failed to add comment'}
    except Exception as e :
        print(f"Error adding comment: {e}")
        return {'success': False, 'error': str(e)}
    
def add_report(data):
    try:
        reporter = data.get('reporter_id')
        comment = data.get('comment_id')
        reason = data.get('reason')

        response = supabase \
                    .from_("comment_report") \
                    .insert({
                        'reporter_id': reporter,
                        'comment_id': comment,
                        'reason':reason,
                    }) \
                    .execute()
        if response.data:
            return {'success': True}
        else:
            return {'success': False, 'error':'failed to report comment'}
    except Exception as e :
        print(f"Error reporting comment: {e}")
        return {'success': False, 'error': str(e)}
    
def get_comments(resource_id):
    try:
        response = supabase \
            .from_('Rating') \
            .select('rat_id, comment, rating, rat_date, user_id, User(u_name)') \
            .eq('res_id', resource_id) \
            .execute()
        
        if not response.data:
            return []
        return response.data  # Return just the data array
    except Exception as e:
        print(f"Error getting comments: {e}")
        return []

def mark_late_reservations():
    """
    This function checks all active reservations and sets their status to 'Late' if the due date is passed.
    Should be run daily (e.g., via cron or scheduler).
    """
    try:
        active_statuses = [1, 3, 5]  # 1: Borrow, 3: Renew_1, 5: Renew_2
        reservations = supabase.from_("Reservation").select("res_id, res_user_id, res_resource_id, res_type, res_date").in_("res_type", active_statuses).execute()
        for res in reservations.data:
            user_id = res['res_user_id']
            res_type = res['res_type']
            res_date = res['res_date']
            user = supabase.from_("User").select("u_type, User_type(ut_borrow, ut_renew)").eq("u_id", user_id).single().execute().data
            ut_borrow = user['User_type']['ut_borrow'] if user and user.get('User_type') else 0
            ut_renew = user['User_type']['ut_renew'] if user and user.get('User_type') else 0
            resource = supabase.from_("Resource").select("r_type, Resource_type(rt_borrow)").eq("r_id", res['res_resource_id']).single().execute().data
            rt_borrow = resource.get('Resource_type', {}).get('rt_borrow') if resource else None
            borrow_limit = rt_borrow if rt_borrow and rt_borrow > 1 else ut_borrow
            from datetime import datetime, timedelta
            borrow_date = datetime.fromisoformat(res_date.replace('Z', '+00:00'))
            if res_type == 1:
                due_date = borrow_date + timedelta(days=borrow_limit)
            elif res_type == 3:
                due_date = borrow_date + timedelta(days=borrow_limit + ut_renew)
            elif res_type == 5:
                due_date = borrow_date + timedelta(days=borrow_limit + 2 * ut_renew)
            else:
                continue
            if datetime.now() > due_date:
                supabase.from_("Reservation").update({"res_type": 4}).eq("res_id", res['res_id']).execute()
    except Exception as e:
        print(f"Error in mark_late_reservations: {e}")

def delete_comment(comment_id):
    """
    Delete a comment from the Rating table
    """
    try:
        # Delete the comment
        response = supabase \
            .from_('Rating') \
            .delete() \
            .eq('rat_id', comment_id) \
            .execute()

        if response.data:
            return {'success': True, 'message': 'Comment deleted successfully'}
        else:
            return {'success': False, 'error': 'Failed to delete comment'}
    except Exception as e:
        print('Error in delete_comment:', e)
        return {'success': False, 'error': str(e)}

def add_suggestion(user_id, content):
    """
    Add a new suggestion to the Suggestions table
    """
    try:
        response = supabase.table('Suggestions').insert({
            'sug_user_id': user_id,
            'sug_content': content,
            'sug_date': datetime.now().isoformat()
        }).execute()
        
        if response.data:
            return {
                'success': True,
                'message': 'Suggestion added successfully'
            }
        else:
            return {
                'success': False,
                'error': 'Failed to add suggestion'
            }
    except Exception as e:
        print(f"Error in add_suggestion: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def fetch_all_suggestions():
    """
    Get all suggestions with user names from the Suggestions table
    """
    try:
        # First get all suggestions
        response = supabase \
            .from_('Suggestions') \
            .select('sug_id, sug_content, sug_date, sug_user_id') \
            .order('sug_date', desc=True) \
            .execute()
        
        if not response.data:
            return []
            
        suggestions = []
        for suggestion in response.data:
            try:
                # Get user details separately
                user_response = supabase \
                    .from_('User') \
                    .select('u_name, u_email') \
                    .eq('u_id', suggestion['sug_user_id']) \
                    .single() \
                    .execute()
                
                user_data = user_response.data if user_response.data else None
                
                suggestion_data = {
                    'id': suggestion['sug_id'],
                    'content': suggestion['sug_content'],
                    'date': suggestion['sug_date'],
                    'user_id': suggestion['sug_user_id'],
                    'user_name': user_data['u_name'] if user_data else 'Unknown',
                    'user_email': user_data['u_email'] if user_data else 'Unknown'
                }
                suggestions.append(suggestion_data)
            except Exception as e:
                print(f"Error processing suggestion {suggestion.get('sug_id')}: {e}")
                continue
        
        return suggestions
    except Exception as e:
        print(f"Error getting suggestions: {e}")
        return []

def delete_suggestion(suggestion_id):
    """
    Delete a suggestion from the Suggestions table
    """
    try:
        response = supabase \
            .from_('Suggestions') \
            .delete() \
            .eq('sug_id', suggestion_id) \
            .execute()

        if response.data:
            return {'success': True, 'message': 'Suggestion deleted successfully'}
        else:
            return {'success': False, 'error': 'Failed to delete suggestion'}
    except Exception as e:
        print('Error in delete_suggestion:', e)
        return {'success': False, 'error': str(e)}

def report_comment(reporter_id, comment_id, reason):
    try:
        # Insert into comment_report table
        result = supabase.table('comment_report').insert({
            'reporter_id': reporter_id,
            'comment_id': comment_id,
            'reason': reason,
            'date': datetime.now().isoformat()
        }).execute()
        
        if result.error:
            raise Exception(result.error.message)
            
        return {'success': True, 'message': 'Comment reported successfully'}
    except Exception as e:
        print(f"Error reporting comment: {str(e)}")
        return {'success': False, 'error': str(e)}

def delete_report(report_id):
    """
    Delete a report from the database by its ID.
    :param report_id: The ID of the report to delete.
    """
    try:
        response = supabase.from_("comment_report").delete().eq("id", report_id).execute()

        if response.data:
            return {'success': True, 'message': 'Report deleted successfully'}
        else:
            return {'success': False, 'error': 'Report not found or could not be deleted'}
    except Exception as e:
        print(f"Error deleting report: {e}")
        return {'success': False, 'error': str(e)}