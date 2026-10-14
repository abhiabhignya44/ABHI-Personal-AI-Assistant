import os
import mysql.connector
from dotenv import load_dotenv
from mysql.connector import Error

# Load database credentials from the .env file
load_dotenv()

connection = None

try:
    # Connect to the local MySQL database
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD"),
        database="personal_ai"
    )

    if connection.is_connected():
        print("MySQL connection successful!")

        # Check the selected database
        cursor = connection.cursor()
        cursor.execute("SELECT DATABASE()")
        database_name = cursor.fetchone()[0]

        print(f"Connected database: {database_name}")

        cursor.close()

except Error as error:
    print("MySQL connection failed.")
    print(f"Error: {error}")

finally:
    if connection is not None and connection.is_connected():
        connection.close()
        print("MySQL connection closed.")