-- Migration script to allow NULL values for the 'verified' column in clubs table
-- This is needed to support the rejected club status (verified = null)

USE unisocial;

-- Modify the 'verified' column to allow NULL values
ALTER TABLE clubs 
MODIFY COLUMN verified TINYINT(1) DEFAULT FALSE;

-- Verify the change
DESCRIBE clubs;




