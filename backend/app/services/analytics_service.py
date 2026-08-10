from sqlalchemy.orm import Session
from datetime import datetime, timedelta

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_metrics(self) -> dict:
        # Mock metrics for Executive Dashboard
        return {
            "total_contracts": 1420,
            "active_contracts": 850,
            "contracts_in_negotiation": 45,
            "total_value": 25400000.00,
            "avg_approval_time_days": 4.2
        }

    def get_monthly_trends(self) -> list:
        # Mock monthly trend data
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        trends = []
        base_val = 100
        for m in months:
            trends.append({
                "month": m,
                "new_contracts": base_val,
                "renewals": int(base_val * 0.3),
                "expiring": int(base_val * 0.2)
            })
            base_val += 15
        return trends

    def get_contract_type_distribution(self) -> list:
        # Mock distribution
        return [
            {"name": "NDA", "value": 400},
            {"name": "MSA", "value": 300},
            {"name": "SOW", "value": 500},
            {"name": "Employment", "value": 150},
            {"name": "Vendor", "value": 70}
        ]

    def get_department_reports(self) -> list:
        # Mock department metrics
        return [
            {"department": "Sales", "active_contracts": 350, "value": 15000000},
            {"department": "HR", "active_contracts": 200, "value": 0},
            {"department": "Procurement", "active_contracts": 180, "value": -5000000},
            {"department": "Legal", "active_contracts": 50, "value": 0},
            {"department": "IT", "active_contracts": 70, "value": -1200000}
        ]

    def get_performance_metrics(self) -> dict:
        # Mock performance for reviewers/vendors
        return {
            "reviewers": [
                {"name": "Alice Smith", "contracts_reviewed": 45, "avg_turnaround_hrs": 12},
                {"name": "Bob Jones", "contracts_reviewed": 38, "avg_turnaround_hrs": 18},
                {"name": "Carol Williams", "contracts_reviewed": 52, "avg_turnaround_hrs": 9}
            ],
            "vendors": [
                {"name": "TechCorp", "contracts": 12, "risk_score": "Low"},
                {"name": "GlobalSupplies", "contracts": 8, "risk_score": "Medium"},
                {"name": "FastDelivery", "contracts": 3, "risk_score": "High"}
            ]
        }
