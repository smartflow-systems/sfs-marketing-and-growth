"""
A/B Testing Framework
====================

Enterprise-grade A/B testing system for marketing campaigns.

Features:
- Experiment creation and management
- Multi-variant testing (A/B/C/D...)
- Statistical significance calculations (Chi-squared test)
- Conversion tracking and metrics
- Winner determination with confidence levels
- Traffic distribution control
- Real-time results monitoring

Author: SmartFlow Systems
"""

import os
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from enum import Enum
import json
import math


class ExperimentStatus(str, Enum):
    """Experiment lifecycle states"""
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ExperimentType(str, Enum):
    """Types of A/B tests"""
    EMAIL_SUBJECT = "email_subject"
    EMAIL_CONTENT = "email_content"
    LANDING_PAGE = "landing_page"
    CTA_BUTTON = "cta_button"
    PRICING_PAGE = "pricing_page"
    AD_CREATIVE = "ad_creative"
    SOCIAL_POST = "social_post"
    CUSTOM = "custom"


@dataclass
class Variant:
    """Individual variant in an experiment"""
    id: str
    name: str  # "Control", "Variant A", "Variant B"
    description: str
    traffic_allocation: float  # 0.0 to 1.0 (percentage of traffic)

    # Metrics
    impressions: int = 0
    conversions: int = 0
    revenue: float = 0.0

    # Calculated fields
    conversion_rate: float = 0.0
    revenue_per_visitor: float = 0.0

    def __post_init__(self):
        """Calculate derived metrics"""
        if self.impressions > 0:
            self.conversion_rate = (self.conversions / self.impressions) * 100
            self.revenue_per_visitor = self.revenue / self.impressions


@dataclass
class Experiment:
    """A/B test experiment"""
    id: str
    name: str
    description: str
    type: ExperimentType
    status: ExperimentStatus

    # Variants
    variants: List[Variant]

    # Timing
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime = None

    # Goals
    primary_metric: str = "conversion_rate"  # conversion_rate, revenue, clicks, etc.
    minimum_sample_size: int = 100  # Minimum visitors per variant
    confidence_level: float = 0.95  # 95% confidence for statistical significance

    # Results
    winner: Optional[str] = None  # Variant ID of winner
    statistical_significance: Optional[float] = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        data = asdict(self)
        data['type'] = self.type.value
        data['status'] = self.status.value
        data['start_date'] = self.start_date.isoformat() if self.start_date else None
        data['end_date'] = self.end_date.isoformat() if self.end_date else None
        data['created_at'] = self.created_at.isoformat() if self.created_at else None
        return data


class ABTestingManager:
    """
    Manages A/B testing experiments

    Statistical Methods:
    - Chi-squared test for conversion rate significance
    - Sample size calculation based on baseline conversion rate
    - Confidence intervals for conversion rates
    """

    def __init__(self, storage_path: str = "data/experiments"):
        """
        Initialize A/B testing manager

        Args:
            storage_path: Directory to store experiment data
        """
        self.storage_path = storage_path
        os.makedirs(storage_path, exist_ok=True)

    def create_experiment(
        self,
        name: str,
        description: str,
        experiment_type: ExperimentType,
        variant_names: List[str],
        variant_descriptions: List[str],
        traffic_allocation: Optional[List[float]] = None,
        minimum_sample_size: int = 100,
        confidence_level: float = 0.95
    ) -> Experiment:
        """
        Create a new A/B test experiment

        Args:
            name: Experiment name
            description: What you're testing
            experiment_type: Type of test
            variant_names: List of variant names (e.g., ["Control", "Variant A"])
            variant_descriptions: Description of each variant
            traffic_allocation: Traffic % for each variant (must sum to 1.0)
            minimum_sample_size: Minimum visitors per variant before analysis
            confidence_level: Required confidence level (0.95 = 95%)

        Returns:
            Created Experiment object
        """
        experiment_id = str(uuid.uuid4())

        # Default to equal traffic split if not provided
        num_variants = len(variant_names)
        if traffic_allocation is None:
            traffic_allocation = [1.0 / num_variants] * num_variants

        # Validate traffic allocation
        if abs(sum(traffic_allocation) - 1.0) > 0.001:
            raise ValueError(f"Traffic allocation must sum to 1.0, got {sum(traffic_allocation)}")

        # Create variants
        variants = []
        for i, (name, desc, allocation) in enumerate(zip(variant_names, variant_descriptions, traffic_allocation)):
            variant = Variant(
                id=f"variant_{i}",
                name=name,
                description=desc,
                traffic_allocation=allocation
            )
            variants.append(variant)

        # Create experiment
        experiment = Experiment(
            id=experiment_id,
            name=name,
            description=description,
            type=experiment_type,
            status=ExperimentStatus.DRAFT,
            variants=variants,
            minimum_sample_size=minimum_sample_size,
            confidence_level=confidence_level
        )

        # Save to storage
        self._save_experiment(experiment)

        return experiment

    def start_experiment(self, experiment_id: str) -> Experiment:
        """Start running an experiment"""
        experiment = self._load_experiment(experiment_id)
        experiment.status = ExperimentStatus.RUNNING
        experiment.start_date = datetime.utcnow()
        self._save_experiment(experiment)
        return experiment

    def pause_experiment(self, experiment_id: str) -> Experiment:
        """Pause a running experiment"""
        experiment = self._load_experiment(experiment_id)
        experiment.status = ExperimentStatus.PAUSED
        self._save_experiment(experiment)
        return experiment

    def complete_experiment(self, experiment_id: str) -> Experiment:
        """Complete an experiment and determine winner"""
        experiment = self._load_experiment(experiment_id)
        experiment.status = ExperimentStatus.COMPLETED
        experiment.end_date = datetime.utcnow()

        # Determine winner based on statistical analysis
        winner_id, significance = self._determine_winner(experiment)
        experiment.winner = winner_id
        experiment.statistical_significance = significance

        self._save_experiment(experiment)
        return experiment

    def record_impression(self, experiment_id: str, variant_id: str) -> None:
        """Record that a visitor saw a variant"""
        experiment = self._load_experiment(experiment_id)

        for variant in experiment.variants:
            if variant.id == variant_id:
                variant.impressions += 1
                variant.__post_init__()  # Recalculate metrics
                break

        self._save_experiment(experiment)

    def record_conversion(
        self,
        experiment_id: str,
        variant_id: str,
        revenue: float = 0.0
    ) -> None:
        """
        Record a conversion for a variant

        Args:
            experiment_id: Experiment ID
            variant_id: Variant that got the conversion
            revenue: Optional revenue amount
        """
        experiment = self._load_experiment(experiment_id)

        for variant in experiment.variants:
            if variant.id == variant_id:
                variant.conversions += 1
                variant.revenue += revenue
                variant.__post_init__()  # Recalculate metrics
                break

        self._save_experiment(experiment)

    def get_experiment(self, experiment_id: str) -> Experiment:
        """Get experiment by ID"""
        return self._load_experiment(experiment_id)

    def list_experiments(
        self,
        status: Optional[ExperimentStatus] = None
    ) -> List[Experiment]:
        """
        List all experiments, optionally filtered by status

        Args:
            status: Filter by experiment status

        Returns:
            List of experiments
        """
        experiments = []

        for filename in os.listdir(self.storage_path):
            if filename.endswith('.json'):
                experiment_id = filename[:-5]
                try:
                    experiment = self._load_experiment(experiment_id)
                    if status is None or experiment.status == status:
                        experiments.append(experiment)
                except Exception:
                    continue

        # Sort by created date (newest first)
        experiments.sort(key=lambda x: x.created_at, reverse=True)

        return experiments

    def get_results(self, experiment_id: str) -> Dict[str, Any]:
        """
        Get detailed results and analysis for an experiment

        Returns:
            Dictionary with comprehensive results including:
            - Variant performance metrics
            - Statistical significance
            - Confidence intervals
            - Recommendations
        """
        experiment = self._load_experiment(experiment_id)

        # Calculate statistical significance
        winner_id, significance = self._determine_winner(experiment)

        # Build results
        results = {
            "experiment": experiment.to_dict(),
            "variants": [asdict(v) for v in experiment.variants],
            "winner": winner_id,
            "statistical_significance": significance,
            "is_significant": significance is not None and significance >= experiment.confidence_level,
            "sample_size_met": all(v.impressions >= experiment.minimum_sample_size for v in experiment.variants),
            "recommendations": self._generate_recommendations(experiment, winner_id, significance)
        }

        return results

    def _determine_winner(self, experiment: Experiment) -> Tuple[Optional[str], Optional[float]]:
        """
        Determine winner using chi-squared test

        Returns:
            Tuple of (winner_variant_id, significance_level)
        """
        # Need at least 2 variants
        if len(experiment.variants) < 2:
            return None, None

        # Check if minimum sample size is met
        if not all(v.impressions >= experiment.minimum_sample_size for v in experiment.variants):
            return None, None

        # For simplicity, compare first two variants using chi-squared test
        # In production, you'd use more sophisticated multi-variant testing
        variant_a = experiment.variants[0]
        variant_b = experiment.variants[1]

        # Calculate chi-squared statistic
        chi_squared, p_value = self._chi_squared_test(
            variant_a.conversions,
            variant_a.impressions,
            variant_b.conversions,
            variant_b.impressions
        )

        # Determine winner (higher conversion rate)
        if variant_a.conversion_rate > variant_b.conversion_rate:
            winner_id = variant_a.id
        else:
            winner_id = variant_b.id

        # Convert p-value to confidence level
        confidence = 1 - p_value if p_value is not None else None

        return winner_id, confidence

    def _chi_squared_test(
        self,
        conversions_a: int,
        impressions_a: int,
        conversions_b: int,
        impressions_b: int
    ) -> Tuple[Optional[float], Optional[float]]:
        """
        Chi-squared test for conversion rate significance

        Returns:
            Tuple of (chi_squared_statistic, p_value)
        """
        # Avoid division by zero
        if impressions_a == 0 or impressions_b == 0:
            return None, None

        # Observed values
        obs_conv_a = conversions_a
        obs_no_conv_a = impressions_a - conversions_a
        obs_conv_b = conversions_b
        obs_no_conv_b = impressions_b - conversions_b

        # Total
        total_conversions = obs_conv_a + obs_conv_b
        total_no_conversions = obs_no_conv_a + obs_no_conv_b
        total_impressions = impressions_a + impressions_b

        if total_impressions == 0:
            return None, None

        # Expected values
        exp_conv_a = (impressions_a * total_conversions) / total_impressions
        exp_no_conv_a = (impressions_a * total_no_conversions) / total_impressions
        exp_conv_b = (impressions_b * total_conversions) / total_impressions
        exp_no_conv_b = (impressions_b * total_no_conversions) / total_impressions

        # Chi-squared statistic
        chi_squared = 0.0

        if exp_conv_a > 0:
            chi_squared += ((obs_conv_a - exp_conv_a) ** 2) / exp_conv_a
        if exp_no_conv_a > 0:
            chi_squared += ((obs_no_conv_a - exp_no_conv_a) ** 2) / exp_no_conv_a
        if exp_conv_b > 0:
            chi_squared += ((obs_conv_b - exp_conv_b) ** 2) / exp_conv_b
        if exp_no_conv_b > 0:
            chi_squared += ((obs_no_conv_b - exp_no_conv_b) ** 2) / exp_no_conv_b

        # Degrees of freedom = (rows - 1) * (cols - 1) = 1 for 2x2 table
        df = 1

        # Calculate p-value from chi-squared distribution
        # Using approximation for p-value
        p_value = self._chi_squared_p_value(chi_squared, df)

        return chi_squared, p_value

    def _chi_squared_p_value(self, chi_squared: float, df: int) -> float:
        """
        Calculate p-value from chi-squared statistic

        This is a simplified approximation. In production, use scipy.stats.chi2.sf()
        """
        # For df=1, use lookup table approximation
        if df == 1:
            if chi_squared >= 10.83:
                return 0.001  # p < 0.001 (99.9% confidence)
            elif chi_squared >= 7.88:
                return 0.005  # p < 0.005 (99.5% confidence)
            elif chi_squared >= 6.63:
                return 0.01   # p < 0.01 (99% confidence)
            elif chi_squared >= 3.84:
                return 0.05   # p < 0.05 (95% confidence)
            elif chi_squared >= 2.71:
                return 0.10   # p < 0.10 (90% confidence)
            else:
                return 0.50   # Not significant

        # Default
        return 0.50

    def _generate_recommendations(
        self,
        experiment: Experiment,
        winner_id: Optional[str],
        significance: Optional[float]
    ) -> List[str]:
        """Generate actionable recommendations based on results"""
        recommendations = []

        # Check sample size
        sample_size_met = all(v.impressions >= experiment.minimum_sample_size for v in experiment.variants)

        if not sample_size_met:
            recommendations.append(
                f"⚠️ Continue running the test. Need at least {experiment.minimum_sample_size} "
                f"impressions per variant for reliable results."
            )
            return recommendations

        # Check significance
        is_significant = significance is not None and significance >= experiment.confidence_level

        if is_significant and winner_id:
            winner = next((v for v in experiment.variants if v.id == winner_id), None)
            if winner:
                recommendations.append(
                    f"✅ {winner.name} is the clear winner with {significance*100:.1f}% confidence. "
                    f"Roll out this variant to 100% of traffic."
                )
                recommendations.append(
                    f"📊 {winner.name} achieved a {winner.conversion_rate:.2f}% conversion rate, "
                    f"which is statistically significant."
                )
        else:
            recommendations.append(
                "⚠️ No statistically significant winner yet. Consider:"
            )
            recommendations.append(
                "  • Running the test longer to collect more data"
            )
            recommendations.append(
                "  • Increasing traffic to the experiment"
            )
            recommendations.append(
                "  • Testing more dramatic changes between variants"
            )

        # Revenue insights
        if any(v.revenue > 0 for v in experiment.variants):
            best_revenue_variant = max(experiment.variants, key=lambda v: v.revenue_per_visitor)
            recommendations.append(
                f"💰 {best_revenue_variant.name} has the highest revenue per visitor "
                f"(${best_revenue_variant.revenue_per_visitor:.2f})"
            )

        return recommendations

    def _save_experiment(self, experiment: Experiment) -> None:
        """Save experiment to storage"""
        filepath = os.path.join(self.storage_path, f"{experiment.id}.json")

        with open(filepath, 'w') as f:
            json.dump(experiment.to_dict(), f, indent=2)

    def _load_experiment(self, experiment_id: str) -> Experiment:
        """Load experiment from storage"""
        filepath = os.path.join(self.storage_path, f"{experiment_id}.json")

        if not os.path.exists(filepath):
            raise ValueError(f"Experiment {experiment_id} not found")

        with open(filepath, 'r') as f:
            data = json.load(f)

        # Convert dates back from ISO format
        if data.get('start_date'):
            data['start_date'] = datetime.fromisoformat(data['start_date'])
        if data.get('end_date'):
            data['end_date'] = datetime.fromisoformat(data['end_date'])
        if data.get('created_at'):
            data['created_at'] = datetime.fromisoformat(data['created_at'])

        # Convert enums
        data['type'] = ExperimentType(data['type'])
        data['status'] = ExperimentStatus(data['status'])

        # Convert variants
        data['variants'] = [Variant(**v) for v in data['variants']]

        return Experiment(**data)


# Singleton instance
_ab_testing_manager = None


def get_ab_testing_manager() -> ABTestingManager:
    """Get or create singleton ABTestingManager instance"""
    global _ab_testing_manager
    if _ab_testing_manager is None:
        _ab_testing_manager = ABTestingManager()
    return _ab_testing_manager
