# Policies Page Feature Checklist

This checklist tracks the implementation status of key features for a production-grade GRC Policies module.

| Feature                | Status      | Notes |
|------------------------|-------------|-------|
| Name                   | ✅ Implemented | Policy name field present |
| State                  | ✅ Implemented | Basic state (Draft/Review/Approved/Rejected) with dropdown and RBAC |
| Description/Body       | ✅ Implemented | Plain text description/body field present |
| Owner/Author           | ✅ Implemented | Owner auto-assigned (current user) and shown in UI |
| Effective/Review Date  | ✅ Implemented | Date fields present, styled for dark mode, required |
| Versioning             | ✅ Implemented | Version field present and editable |
| Category/Type          | ✅ Implemented | Category dropdown with common values, required |
| Attachments            | ✅ Implemented | Upload, view, and manage attachments per policy |
| Approval Workflow      | ⚠️ Partial  | State can be changed, but no multi-step approval or workflow logic |
| Persistent Comments    | ✅ Implemented | Comments are saved, attributed, and editable |
| Change History         | ⚠️ Partial  | Change history array exists in model, not fully surfaced in UI |
| Permissions            | ⚠️ Partial  | RBAC for add/edit/delete; view/acknowledge not fully granular |
| Read Acknowledgement   | ❌ Missing   | No explicit user acknowledgement/receipt tracking |
| Advanced Search        | ⚠️ Partial  | Multi-string search and filter by state; not by category/owner/date |
| Notifications          | ❌ Missing   | No email or in-app reminders |
| Compliance Mapping     | ❌ Missing   | No UI/logic for mapping policies to controls/requirements |

---

**Legend:**
- ✅ Implemented
- ⚠️ Partial
- ❌ Missing

Update this file as features are added or improved. 