# Reset PostgreSQL Password

## Option 1: Find Your Current Password

Check if you saved it somewhere during installation. Common default passwords:
- `postgres`
- `admin`
- `root`
- Your Windows username
- Empty (no password)

Try these in your `.env` file.

---

## Option 2: Reset Password Using pgAdmin

1. **Open pgAdmin 4**
2. **Connect to server** (it may ask for the master password you set)
3. **Right-click** on "PostgreSQL 15" server
4. **Properties** → **Connection** tab
5. **Change password** to something simple like `postgres123`
6. **Save**

---

## Option 3: Reset Password Using Command Line

### Step 1: Find pg_hba.conf

```bash
psql -U postgres -c "SHOW hba_file;"
```

Or look in: `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`

### Step 2: Edit pg_hba.conf

Open as Administrator in Notepad:

Find this line:
```
host    all             all             127.0.0.1/32            scram-sha-256
```

Change to:
```
host    all             all             127.0.0.1/32            trust
```

Save the file.

### Step 3: Restart PostgreSQL

Open Services (Win + R, type `services.msc`):
1. Find "postgresql-x64-15"
2. Right-click → Restart

### Step 4: Change Password

```bash
psql -U postgres
ALTER USER postgres PASSWORD 'postgres123';
\q
```

### Step 5: Restore pg_hba.conf

Change back to:
```
host    all             all             127.0.0.1/32            scram-sha-256
```

Restart PostgreSQL again.

---

## Option 4: Use XAMPP PostgreSQL (If Installed)

Since you have XAMPP, you might have PostgreSQL there:

Check: `D:\Xampp.2\pgsql\`

If it exists, the default password is usually empty or `root`.

---

## After Resetting Password

Update your `backend/.env` file:

```env
DB_USER=postgres
DB_PASSWORD=postgres123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=senyamatika
```

Then test:
```bash
npm run test-db
```
