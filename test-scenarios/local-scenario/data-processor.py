"""
Data processing utilities for handling large datasets
"""
import pandas as pd
import numpy as np
from typing import List, Dict, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class DataProcessor:
    """
    Main data processing class with various transformation methods
    """
    
    def __init__(self, config: dict = None):
        self.config = config or {}
        self.processed_data = None
        
    def load_csv(self, file_path: str) -> pd.DataFrame:
        """Load CSV file with error handling"""
        try:
            df = pd.read_csv(file_path)
            logger.info(f"Loaded {len(df)} rows from {file_path}")
            return df
        except Exception as e:
            logger.error(f"Failed to load CSV: {e}")
            raise
    
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean dataset by removing duplicates and handling nulls"""
        # Remove duplicates
        df_clean = df.drop_duplicates()
        
        # Handle missing values
        for column in df_clean.columns:
            if df_clean[column].dtype == 'object':
                df_clean[column].fillna('unknown', inplace=True)
            else:
                df_clean[column].fillna(df_clean[column].mean(), inplace=True)
        
        return df_clean
