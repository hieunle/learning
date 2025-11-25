# Electrodry AI Helpdesk -- Clarified Requirements

## 1. Overview

Electrodry wants to build an **AI Helpdesk** system that will serve both
**internal agents/technicians** and **customers**.\
It will eventually support pre-sales, post-sales, agent assistance,
technical knowledge, quoting, and integrations.

To begin, the client only wants an **MVP focusing on Agent Assist +
Knowledge Base**.

------------------------------------------------------------------------

## 2. Full Feature Set (Long-Term Vision)

### 2.1 Pre-Booking (Lead Gen & Booking Flow)

-   FAQs grounded in Electrodry's website content\
-   Coverage check (postcode/suburb → serviceable area + local
    specials)\
-   Quote range estimator (rooms/m²/seats + extras; with disclaimers)\
-   Create booking / create lead (handed off to a human rep)\
-   Promotions / upsell suggestions\
-   Additional channels: WhatsApp, SMS, Messenger

### 2.2 Post-Sales & Support

-   Reschedule / cancel requests\
-   Job reminders & preparation checklist (SMS / Email)\
-   Aftercare Q&A (drying time, care, warranty, maintenance tips)

### 2.3 Agent Assist & Knowledge (Core AI Skills)

-   AI-generated suggested replies for agents\
-   RAG + knowledge base with citations to Electrodry's approved
    content\
-   Technical support for technicians (e.g., how to calculate pricing,
    troubleshooting steps)

### 2.4 Integrations (Optional / Future)

-   CRM / Job system:
    -   ServiceTitan\
    -   Jobber\
    -   Housecall Pro\
    -   HubSpot\
    -   Salesforce\
-   Scheduling & availability lookup\
-   Helpdesk/live chat integration:
    -   Zendesk\
    -   Intercom\
-   Payments (deposits, refunds)

------------------------------------------------------------------------

## 3. Technical Foundations Required

-   **Canonical content**: A single, authoritative source of truth for
    all service information\
-   **Structured data**:
    -   Pricing tables\
    -   Coverage rules\
    -   Service routing logic\
-   **Brand & compliance rules** for tone, accuracy, and response
    constraints\
-   **Optional integrations** depending on phase\
-   **Widget**:
    -   Lightweight JS snippet for embedding on Electrodry's website\
-   **RAG Knowledge Base**:
    -   Ingest approved pages\
    -   AI answers must cite those pages\
-   **Conversation Flows**:
    -   Postcode → coverage\
    -   Quote range estimation\
    -   Booking / lead creation → handoff to human\
    -   Escalation rules\
-   **Guardrails**:
    -   No invented prices\
    -   Regional restrictions enforced

------------------------------------------------------------------------

## 4. MVP (Phase 1) --- What They Want to Start With

### **Focus Areas**

1.  **Agent Assist**
    -   Provide suggested replies for customer service agents and
        technicians\
    -   Include business rules (pricing, coverage, service eligibility)\
    -   Brand-safe tone & guardrails
2.  **Knowledge Base with Citations**
    -   Use RAG to pull from approved Electrodry content\
    -   Every answer must cite the source\
    -   Store technical, operational, and procedural knowledge\
    -   Useful for the entire business (CS team + technicians in the
        field)

### **Intended Use Cases**

-   Help agents answer questions accurately and quickly\
-   Support technicians with technical instructions and pricing
    explanations\
-   Allow customers to ask:
    -   Pre-sales questions\
    -   General cleaning/care inquiries ("How to remove coffee stains?",
        etc.)\
    -   DIY home maintenance tips

------------------------------------------------------------------------

## 5. Summary of Clarified Requirements

-   Start small: **Agent Assist + RAG Knowledge Base**\
-   Future phases include booking, quoting, CRM integrations, payments,
    and customer-facing widget\
-   Must enforce business rules (pricing, coverage, service
    eligibility)\
-   Must produce reliable, sourced responses (no hallucinations)\
-   Long-term goal: A single AI-powered helpdesk for all internal teams
    and end customers
