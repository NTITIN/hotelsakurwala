# Hotel POS, Billing & Operations Management Suite

A full-featured Hotel & Restaurant Point of Sale (POS), Table-wise Ordering, and Restricted Billing Suite built with React, Vite, and Tailwind CSS. Specially integrated and calibrated for **58mm Mini Mobile Thermal Receipt Printers (SHREYANS Bill Smart 588)**.

---

## 🚀 Key Features

- **Strict Role-Based Billing & Printing**:
  - Only authenticated Admin & Manager credentials can generate and print official table tax invoices.
  - Waiter / service staff are blocked from printing bills without supervisor PIN override.
- **58mm Portable Thermal Printer Integration**:
  - Tailored specifically for **SHREYANS Mini Mobile Receipt Printer (58mm Bill Smart 588)**.
  - Zero-margin print CSS (`@page { size: 58mm auto; margin: 0; }`) to eliminate paper clipping.
  - Compact 32-column layout with colon-aligned metadata (`Date`, `Receipt #`, `Table`, `Guest`, `Cashier`).
  - High-density compact UPI QR code (22mm / 80px) for quick mobile payment scanning without paper roll overflow.
  - Direct Web Bluetooth (ESC/POS) wireless print support & 1-click test alignment slips.
  - Also supports 80mm desktop thermal printers and formal A4 corporate tax invoices.
- **Interactive Floor Plan & Table POS**:
  - Live table cards across multiple sections (Main Dining, Garden Terrace, Rooftop Lounge, VIP Dining).
  - Add & edit tables with custom capacities (2p, 4p, 6p, 8p, 10p, 12p) and sections.
  - Real-time KOT (Kitchen Order Ticket) generation.
- **Menu & Price Management**:
  - Add, edit, and organize menu dishes with prices, categories, preparation times, and dietary tags (Veg, Non-Veg, Vegan, Beverage).
  - Instant out-of-stock / 86'd toggle switches.
- **Invoice Revision & Audit**:
  - Edit past invoices (quantities, custom item rates, guest details, payment modes) with dynamic financial recalculation.
- **Sales & Financial Reports**:
  - Day-wise sales registers with date picker and CSV export.
  - Month-wise reporting with daily turnover bar charts.
  - Year-wise annual financial statements and fiscal year comparisons.
- **Accounts & Profit/Loss Ledgers**:
  - Comprehensive P&L calculation engine: Operating Revenue, Cost of Goods Sold (COGS), Gross Profit, Operating Overhead Expenses (OPEX), and Net Profit margin.
  - General ledger voucher entry for kitchen grocery purchases, utility bills, salaries, and maintenance.

---

## 🔑 Station Login Credential

| Username / Email | Password | Role & Authority |
| :--- | :--- | :--- |
| **`admin@hotel.com`** | **`admin`** *(or `admin123`)* | **👑 Administrator & General Manager** (Full Authority: POS, Print, Menu, Tables, Reports, P&L) |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Lucide Icons, Outfit & Plus Jakarta Sans typography
- **State & Persistence**: React Context API, Browser `localStorage`
- **Thermal Printing**: ESC/POS, Web Bluetooth API, CSS `@media print`
- **Audio Feedback**: Web Audio API synthesized chimes

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/NTITIN/hotelsakurwala.git
cd hotelsakurwala
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 🖨️ Thermal Printer Setup (SHREYANS 588)

1. Turn ON the Shreyans 588 printer (Power LED illuminates green).
2. In Windows Settings &rarr; **Bluetooth & devices** &rarr; **Add device** &rarr; Select **588** or **MTP-II** (PIN: `0000` or `1234`).
3. In Chrome / Edge Print Dialog (Ctrl+P):
   - Destination: Select your Shreyans / POS-58 printer.
   - Paper Size: **58mm x 210mm** (or Roll Paper 58mm).
   - Margins: **None / Minimum**.
