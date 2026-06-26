# LUNORA Database Backup & Recovery Manual

This manual details how to back up and restore database collections on MongoDB Atlas or local staging containers.

## 💾 1. Backup Operations

### MongoDB Atlas Automated Backups (Recommended)
1. Go to your **MongoDB Atlas console**.
2. Navigate to your Database cluster and open the **Backup** tab.
3. Enable Cloud Backups and configure retention schedules (e.g. daily, weekly, monthly snapshots).

### Manual CLI Backup (via mongodump)
To back up the database manually, run `mongodump` passing the SRV URI:
```bash
mongodump --uri="mongodb+srv://<username>:<password>@cluster.mongodb.net/lunora" --out="./backup-data"
```

---

## ↩️ 2. Recovery Operations

### Atlas Point-in-Time Restore
1. Open the **Backup** tab in the Atlas Console.
2. Select the snapshot to restore and click **Restore**.
3. Choose the target cluster (or clone to a temporary cluster to verify data integrity first).

### Manual CLI Restore (via mongorestore)
To restore a manual backup archive into MongoDB, run `mongorestore`:
```bash
mongorestore --uri="mongodb+srv://<username>:<password>@cluster.mongodb.net/lunora" "./backup-data"
```
