"""Price lookup tool for service pricing."""
from typing import Dict, Any, Optional

# Mock pricing data - in production, this would come from a database or API
PRICING_RULES = {
    "carpet_cleaning": {
        "base_price": 150.0,
        "per_sqm": 5.0,
        "regions": {
            "NSW": {"available": True, "multiplier": 1.0},
            "VIC": {"available": True, "multiplier": 1.05},
            "QLD": {"available": True, "multiplier": 0.95},
            "WA": {"available": True, "multiplier": 1.1},
            "SA": {"available": True, "multiplier": 1.0},
        }
    },
    "upholstery_cleaning": {
        "base_price": 80.0,
        "per_item": 40.0,
        "regions": {
            "NSW": {"available": True, "multiplier": 1.0},
            "VIC": {"available": True, "multiplier": 1.05},
            "QLD": {"available": True, "multiplier": 0.95},
            "WA": {"available": True, "multiplier": 1.1},
            "SA": {"available": True, "multiplier": 1.0},
        }
    },
    "tile_cleaning": {
        "base_price": 200.0,
        "per_sqm": 8.0,
        "regions": {
            "NSW": {"available": True, "multiplier": 1.0},
            "VIC": {"available": True, "multiplier": 1.05},
            "QLD": {"available": True, "multiplier": 0.95},
            "WA": {"available": False, "multiplier": 0},
            "SA": {"available": True, "multiplier": 1.0},
        }
    }
}

# Postcode to region mapping (simplified)
POSTCODE_REGIONS = {
    "2000-2999": "NSW",
    "3000-3999": "VIC",
    "4000-4999": "QLD",
    "5000-5999": "SA",
    "6000-6999": "WA",
}


def get_region_from_postcode(postcode: str) -> Optional[str]:
    """
    Determine region from postcode.
    
    Args:
        postcode: Australian postcode
        
    Returns:
        Region code or None
    """
    try:
        post_int = int(postcode)
        for range_str, region in POSTCODE_REGIONS.items():
            start, end = map(int, range_str.split('-'))
            if start <= post_int <= end:
                return region
    except ValueError:
        pass
    return None


def lookup_price(
    service_type: str,
    postcode: str,
    area_size: Optional[float] = None,
    item_count: Optional[int] = None
) -> Dict[str, Any]:
    """
    Look up pricing for a service based on location and parameters.
    
    Args:
        service_type: Type of service (e.g., 'carpet_cleaning')
        postcode: Customer postcode
        area_size: Area size in square meters (for area-based services)
        item_count: Number of items (for item-based services)
        
    Returns:
        Dictionary with pricing information
    """
    # Normalize service type
    service_type = service_type.lower().replace(" ", "_")
    
    # Check if service exists
    if service_type not in PRICING_RULES:
        return {
            "available": False,
            "error": f"Service type '{service_type}' not found. Available services: {', '.join(PRICING_RULES.keys())}"
        }
    
    # Get region from postcode
    region = get_region_from_postcode(postcode)
    if not region:
        return {
            "available": False,
            "error": f"Invalid postcode '{postcode}' or region not supported"
        }
    
    pricing = PRICING_RULES[service_type]
    region_info = pricing["regions"].get(region)
    
    if not region_info or not region_info["available"]:
        return {
            "available": False,
            "error": f"Service '{service_type}' is not available in {region}",
            "region": region
        }
    
    # Calculate price
    base_price = pricing["base_price"]
    multiplier = region_info["multiplier"]
    
    # Add variable costs
    variable_cost = 0.0
    if "per_sqm" in pricing and area_size:
        variable_cost = pricing["per_sqm"] * area_size
    elif "per_item" in pricing and item_count:
        variable_cost = pricing["per_item"] * item_count
    
    final_price = (base_price + variable_cost) * multiplier
    
    return {
        "available": True,
        "service_type": service_type,
        "region": region,
        "base_price": base_price,
        "variable_cost": variable_cost,
        "regional_multiplier": multiplier,
        "final_price": round(final_price, 2),
        "currency": "AUD"
    }


