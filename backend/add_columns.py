import pymysql

try:
    db = pymysql.connect(host="localhost", user="clm_user", password="ClmUserPass2026!", database="clm_db")
    cursor = db.cursor()
    cursor.execute("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL UNIQUE;")
    cursor.execute("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL;")
    db.commit()
    print("Columns added successfully!")
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'db' in locals():
        db.close()
