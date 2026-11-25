-- BIT 3120 CAT reporting queries
-- October 2026 farmer totals: deliveries, litres and amount per farmer.
SELECT
    f.FarmerNo,
    f.FarmerName,
    COALESCE(SUM(d.Litres), 0) AS TotalLitres,
    COALESCE(SUM(d.Amount), 0) AS TotalAmount,
    COUNT(d.DeliveryID) AS DeliveryCount
FROM farmers f
LEFT JOIN deliveries d
    ON d.FarmerNo = f.FarmerNo
   AND d.Date >= '2026-10-01'
   AND d.Date < '2026-11-01'
WHERE f.Role = 'farmer'
GROUP BY f.FarmerNo, f.FarmerName
ORDER BY f.FarmerNo;

-- Number of deliveries and litres handled by each centre.
SELECT
    c.CentreID,
    c.CentreName,
    COUNT(d.DeliveryID) AS DeliveryCount,
    COALESCE(SUM(d.Litres), 0) AS TotalLitres
FROM centres c
LEFT JOIN deliveries d ON d.CentreID = c.CentreID
GROUP BY c.CentreID, c.CentreName
ORDER BY c.CentreID;
