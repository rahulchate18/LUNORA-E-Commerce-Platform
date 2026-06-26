# LUNORA Production Operations & Disaster Recovery Playbook

This document details database backups, storage asset preservation, logging practices, and disaster recovery procedures to maintain **LUNORA** operational integrity.

---

## 🗄️ 1. Backup Strategy

### MongoDB Atlas Backups
1. **Automated Snapshots (Recommended)**:
   * Access the MongoDB Atlas Dashboard.
   * Under **Database**, click on **Backup**.
   * Turn on **Cloud Backup** settings. Define a retention policy:
     * Daily snapshots retained for 7 days.
     * Weekly snapshots retained for 4 weeks.
     * Monthly snapshots retained for 1 year.
2. **Manual Database Backup (mongodump)**:
   * To create a local snapshot, run:
     ```bash
     mongodump --uri="mongodb+srv://<username>:<password>@cluster.mongodb.net/lunora" --out=./backups/backup-$(date +%F)
     ```

### Cloudinary Asset Backups
Product image assets are stored inside Cloudinary.
1. **Backup Settings**:
   * Navigate to **Cloudinary Console -> Settings -> Security**.
   * Turn on the **Backup** setting. Cloudinary will automatically duplicate all uploads and transformations into their backup storage vault.
2. **Secondary S3 Sync**:
   * Configure Cloudinary to mirror upload logs directly to a designated, read-only AWS S3 bucket.

---

## 📊 2. Production Logs Management

* **App Log Output Location**: Logs are written to `logs/app-YYYY-MM-DD.log` as structured JSON strings.
* **Format**:
  ```json
  {"timestamp":"2026-06-26T12:00:00Z","level":"INFO","message":"User login successful","metadata":{"userId":"6a3..."}}
  ```
* **Rotation Policy**:
  * The custom logger manager checks directories on writes.
  * Files older than 7 days are automatically evicted from local server storage to prevent disk bloating.
* **Log Aggregation**: For production scaling, configure file beat tools (Datadog Agent, Logstash) to scan the `/logs` directory and ship logs to central monitors.

---

## 🚨 3. Disaster Recovery (DR) Steps

### Scenario A: Database Corruption / Deletion
If the database cluster experiences severe corruption:
1. Log into MongoDB Atlas.
2. Navigate to **Backups** tab of your cluster.
3. Select the most recent healthy snapshot and click **Restore**.
4. Choose **Restore to Current Cluster** (or deploy to a temporary replacement cluster).
5. The restore operation will spin up a shadow cluster, verify indexes, copy binary documents, and hot-swap connections.

### Scenario B: Payment Gateway Service Interruption (Razorpay Outage)
If Razorpay experiences a service outage:
1. Verify the outage status on [Razorpay Status Page](https://status.razorpay.com/).
2. Switch storefront parameters to allow Cash on Delivery (COD) as primary checkout.
3. Show a subtle header notice on the storefront informing clients that credit card payments are undergoing temporary maintenance.

### Scenario C: Backend Server Crash / Rollback
If a newly pushed build crashes:
1. Log into your Render/Railway Console.
2. Under your Web Service dashboard, click **Deployments**.
3. Locate the previous stable build deployment ID.
4. Select the options menu next to the stable deployment ID and click **Rollback to this version**.
5. Within 60 seconds, DNS routes will swap back to the stable build, and the new build container will be shut down for inspection.
