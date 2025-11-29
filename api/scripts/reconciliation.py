#!/usr/bin/env python3
"""
Reconciliation script for Gor-Incinerator
Generates monthly fee split reports for Aether Labs and Gor-incinerator

Usage:
    python3 reconciliation.py 2025-01-01 2025-01-31
    python3 reconciliation.py  # Defaults to current month
"""

import os
import sys
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, Any

# Configuration
API_URL = os.getenv("API_URL", "https://api.gor-incinerator.fun")
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "")

# ANSI color codes
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color

def print_error(message: str):
    print(f"{Colors.RED}Error: {message}{Colors.NC}")

def print_success(message: str):
    print(f"{Colors.GREEN}{message}{Colors.NC}")

def print_info(message: str):
    print(f"{Colors.YELLOW}{message}{Colors.NC}")

def get_current_month_dates():
    """Get start and end dates for current month"""
    today = datetime.now()
    start_date = today.replace(day=1).strftime("%Y-%m-%d")
    end_date = today.strftime("%Y-%m-%d")
    return start_date, end_date

def fetch_reconciliation_report(start_date: str, end_date: str) -> Dict[str, Any]:
    """Fetch reconciliation report from API"""
    if not ADMIN_API_KEY:
        print_error("ADMIN_API_KEY environment variable is not set")
        print("Set it with: export ADMIN_API_KEY=your_admin_api_key")
        sys.exit(1)

    url = f"{API_URL}/reconciliation/report"
    params = {
        "start": start_date,
        "end": end_date
    }
    headers = {
        "x-api-key": ADMIN_API_KEY,
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print_error(f"Failed to fetch report: {e}")
        sys.exit(1)

def display_report(data: Dict[str, Any]):
    """Display reconciliation report"""
    period = data["period"]
    summary = data["summary"]
    transactions = data["transactions"]

    print(f"\n{Colors.GREEN}Gor-Incinerator Reconciliation Report{Colors.NC}")
    print("=" * 50)
    print(f"Period: {period['start']} to {period['end']}")
    print()

    print_info("Summary Statistics:")
    print("-" * 50)
    print(f"Total Transactions:    {summary['totalTransactions']}")
    print(f"Total Accounts Closed: {summary['totalAccountsClosed']}")
    print(f"Total Rent Reclaimed:  {summary['totalRent']:.8f} GOR")
    print(f"Total Fees Collected:  {summary['totalFees']:.8f} GOR")
    print()

    print_info("Fee Split (50/50):")
    print("-" * 50)
    print(f"Aether Labs Share:     {summary['aetherLabsShare']:.8f} GOR")
    print(f"Gor-incinerator Share: {summary['gorIncineratorShare']:.8f} GOR")
    print()

    # Transaction status breakdown
    status_counts = {}
    for tx in transactions:
        status = tx["status"]
        status_counts[status] = status_counts.get(status, 0) + 1

    print_info("Transaction Status Breakdown:")
    print("-" * 50)
    for status, count in status_counts.items():
        print(f"{status}: {count} transactions")
    print()

def save_report(data: Dict[str, Any], start_date: str, end_date: str):
    """Save report to JSON file"""
    filename = f"reconciliation_{start_date}_to_{end_date}.json"
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)
    print_success(f"Full report saved to: {filename}")

def export_csv(data: Dict[str, Any], start_date: str, end_date: str):
    """Export transactions to CSV"""
    filename = f"reconciliation_{start_date}_to_{end_date}.csv"
    transactions = data["transactions"]

    with open(filename, "w") as f:
        # Write header
        f.write("ID,Timestamp,Wallet,Accounts Closed,Total Rent,Service Fee,Aether Labs Fee,Gor-incinerator Fee,TX Hash,Status\n")
        
        # Write data
        for tx in transactions:
            f.write(f"{tx['id']},{tx['timestamp']},{tx['wallet']},{tx['accountsClosed']},")
            f.write(f"{tx['totalRent']},{tx['serviceFee']},{tx['aetherLabsFee']},")
            f.write(f"{tx['gorIncineratorFee']},{tx['txHash'] or ''},")
            f.write(f"{tx['status']}\n")
    
    print_success(f"CSV export saved to: {filename}")

def main():
    # Parse command line arguments
    if len(sys.argv) == 3:
        start_date = sys.argv[1]
        end_date = sys.argv[2]
    else:
        start_date, end_date = get_current_month_dates()

    # Fetch report
    print(f"Fetching reconciliation report for {start_date} to {end_date}...")
    data = fetch_reconciliation_report(start_date, end_date)

    # Display report
    display_report(data)

    # Save reports
    save_report(data, start_date, end_date)
    export_csv(data, start_date, end_date)

    print()
    print_success("Reconciliation complete!")

if __name__ == "__main__":
    main()
