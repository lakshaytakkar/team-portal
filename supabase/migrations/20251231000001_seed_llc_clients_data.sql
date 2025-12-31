-- ============================================================================
-- Seed LLC Clients Data from CSV
-- Imports existing client data into llc_clients table
-- ============================================================================

-- Helper function to parse status from CSV
CREATE OR REPLACE FUNCTION parse_llc_status(status_text TEXT) RETURNS llc_client_status AS $$
BEGIN
  RETURN CASE LOWER(TRIM(status_text))
    WHEN 'delivered' THEN 'delivered'::llc_client_status
    WHEN 'onboarded' THEN 'onboarded'::llc_client_status
    WHEN 'under banking' THEN 'under_banking'::llc_client_status
    WHEN 'under ein' THEN 'under_ein'::llc_client_status
    WHEN 'under boi' THEN 'under_boi'::llc_client_status
    WHEN 'under payment gateway' THEN 'under_payment_gateway'::llc_client_status
    WHEN 'llc booked' THEN 'llc_booked'::llc_client_status
    ELSE 'llc_booked'::llc_client_status
  END;
END;
$$ LANGUAGE plpgsql;

-- Helper function to parse health from CSV
CREATE OR REPLACE FUNCTION parse_llc_health(health_text TEXT) RETURNS llc_client_health AS $$
BEGIN
  RETURN CASE LOWER(TRIM(health_text))
    WHEN 'healthy' THEN 'healthy'::llc_client_health
    WHEN 'neutral' THEN 'neutral'::llc_client_health
    WHEN 'at risk' THEN 'at_risk'::llc_client_health
    WHEN 'critical' THEN 'critical'::llc_client_health
    ELSE 'neutral'::llc_client_health
  END;
END;
$$ LANGUAGE plpgsql;

-- Helper function to parse plan from CSV
CREATE OR REPLACE FUNCTION parse_llc_plan(plan_text TEXT) RETURNS llc_service_plan AS $$
BEGIN
  RETURN CASE LOWER(TRIM(plan_text))
    WHEN 'elite' THEN 'elite'::llc_service_plan
    WHEN 'llc' THEN 'llc'::llc_service_plan
    ELSE 'elite'::llc_service_plan
  END;
END;
$$ LANGUAGE plpgsql;

-- Helper function to parse amount (removes currency symbols and commas)
CREATE OR REPLACE FUNCTION parse_inr_amount(amount_text TEXT) RETURNS DECIMAL AS $$
BEGIN
  IF amount_text IS NULL OR TRIM(amount_text) = '' THEN
    RETURN 0;
  END IF;
  -- Remove currency symbol, commas, and whitespace
  RETURN COALESCE(
    NULLIF(
      REGEXP_REPLACE(amount_text, '[₹,$,\s]', '', 'g'),
      ''
    )::DECIMAL,
    0
  );
EXCEPTION WHEN OTHERS THEN
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Insert LLC Clients Data
-- Note: Dates are parsed from various formats in the CSV

INSERT INTO llc_clients (
  serial_number,
  client_code,
  client_name,
  payment_date,
  onboarding_date,
  llc_name,
  status,
  health,
  phone,
  plan,
  website_included,
  country,
  email,
  external_project_url,
  amount_received,
  remaining_payment,
  currency,
  onboarding_call_date,
  document_submission_date,
  bank_approved,
  notes,
  bank_status
) VALUES
-- Old Clients (Jan-Sep 2024)
(1, 'SUPLLC1015', 'Amitava Deb', '2024-01-03', NULL, NULL, 'delivered', 'healthy', '+919775282444', 'elite', true, 'India', NULL, NULL, 0, 0, 'INR', NULL, NULL, NULL, NULL, 'approved'),
(2, 'SUPLLC1017', 'MOHAMMED YUNUS YUSUFBHAI MEMAN', '2024-01-03', NULL, NULL, 'delivered', 'healthy', NULL, 'elite', true, 'India', NULL, NULL, 0, 0, 'INR', NULL, NULL, NULL, NULL, 'approved'),
(3, 'SUPLLC1016', 'Mohammad Javed', '2024-01-04', '2024-04-04', NULL, 'delivered', 'healthy', '+918791181478', 'elite', true, 'India', 'javed.hakimuddin86@gmail.com', NULL, 0, 0, 'INR', '2024-04-04', '2024-04-05', 'Mercury Bank', NULL, 'approved'),
(4, 'SUPLLC1004', 'PRIYANKA KHANNA', '2024-04-10', '2024-04-10', 'ARTEQPEAK INTERNATIONAL LLC', 'delivered', 'at_risk', '+919711707810', 'elite', true, 'India', 'Khannapriyanka.g@gmail.com', NULL, 65000, 0, 'INR', '2024-04-10', '2024-04-10', 'WISE / Airwallex / Payoneer', NULL, 'approved'),
(5, 'SUPLLC1009', 'Sandeep Sharma', '2024-04-19', '2024-04-19', 'TitanTrail LLC', 'delivered', 'neutral', '+919702890100', 'elite', true, 'India', 'sandeepsharma11394@gmail.com', NULL, 70800, 0, 'INR', '2024-04-19', '2024-04-20', 'Mercury Bank', NULL, 'approved'),
(6, 'SUPLLC1002', 'MEGHAV JAGDISHBHAI PATEL', '2024-05-05', '2024-05-11', 'AVIR INTERNATIONAL LLC', 'delivered', 'at_risk', '+917048861911', 'elite', true, 'Australia', 'meghavpatel4321@gmail.com', NULL, 70800, 0, 'INR', '2024-05-11', '2024-05-11', 'Payoneer Bank', NULL, 'approved'),
(7, 'SUPLLC1005', 'Parth Ghantala', '2024-05-17', '2024-05-19', 'PRRAVISH INTERNATIONAL LLC', 'delivered', 'critical', '+918140416981', 'elite', true, 'India', 'ghantalaparth1999@gmail.com', NULL, 59000, 0, 'INR', '2024-05-17', '2024-05-19', 'Payoneer Bank', NULL, 'approved'),
(8, 'SUPLLC1036', 'VIRAL RASIKBHAI KHANT', '2024-06-19', '2024-06-19', 'NENOTECH LLC', 'delivered', 'critical', '+447448928920', 'elite', true, 'United Kingdom', 'khant93viral@gmail.com', NULL, 70800, 0, 'INR', '2024-06-19', '2024-06-21', 'WISE Bank', NULL, 'approved'),
(9, 'SUPLLC1006', 'Anirudh Saileshbhai Harava', '2024-06-22', '2024-06-25', 'Nandan International LLC', 'delivered', 'neutral', '+917567733828', 'elite', true, 'India', 'harvaraanirudh2211@gmail.com', NULL, 60000, 0, 'INR', '2024-06-22', '2024-06-25', 'Payoneer Bank', NULL, 'approved'),
(10, 'SUPLLC1035', 'Pranav Tulshiram Chahande', '2024-06-22', '2024-06-22', 'Praxis Ventures International LLC', 'delivered', 'neutral', '+85269746500', 'elite', true, 'Hong Kong', 'pranav.chahande@gmail.com', NULL, 70800, 0, 'INR', '2024-06-22', '2024-06-22', 'WISE Bank', NULL, 'approved'),
(11, 'SUPLLC1003', 'Shiv Prakash', '2024-07-09', '2024-07-14', 'Shimoraa LLC', 'delivered', 'neutral', '+918806665772', 'elite', true, 'India', 'shivkangidsp@gmail.com', NULL, 70800, 0, 'INR', '2024-07-09', '2024-07-14', 'Mercury Bank / Payoneer Bank', NULL, 'approved'),
(12, 'SUPLLC1039', 'Kamlesh Baline', '2024-07-15', '2024-07-16', 'Crown Vista Group LLC', 'delivered', 'at_risk', '+919764539797', 'elite', true, 'India', 'kamleshbaline@gmail.com', NULL, 60000, 0, 'INR', '2024-07-15', '2024-07-16', 'Payoneer Bank', NULL, 'approved'),
(13, 'SUPLLC1008', 'Pratiksha Yadav (Ashish Yadav)', '2024-07-17', '2024-07-17', 'Shaasta LLC', 'delivered', 'neutral', '+917999697501', 'elite', true, 'India', 'gunjantraders2010@gmail.com', NULL, 70800, 0, 'INR', '2024-07-18', '2024-08-07', 'Payoneer Bank', NULL, 'approved'),
(14, 'SUPLLC1012', 'ABHISHEK VIPIN KHARADE', '2024-07-18', '2024-07-18', 'ADDTUKART LLC', 'delivered', 'at_risk', '+918605727272', 'elite', true, 'India', 'abhishekvkaarande@gmail.com', NULL, 70800, 0, 'INR', '2024-07-18', '2024-07-23', 'Payoneer Bank', NULL, 'approved'),
(15, 'SUPLLC1001', 'Anupa Mukherjee', '2024-07-24', '2024-07-26', 'ZENZKART LLC', 'delivered', 'critical', '+919038640333', 'elite', true, 'India', 'anupa@pixonmediahouse.com', NULL, 59999, 0, 'INR', '2024-07-24', '2024-07-26', 'Mercury Bank', 'Offer Super 30 Free', 'approved'),
(16, 'SUPLLC1013', 'Jatinder Singh', '2024-07-26', '2024-07-23', 'JATSIN LLC', 'delivered', 'neutral', '+917838240459', 'elite', true, 'India', 'jatinderdigitals@gmail.com', NULL, 61300, 0, 'INR', '2024-07-26', '2024-07-27', 'WISE / Airwallex / Payoneer', NULL, 'approved'),
(17, 'SUPLLC1011', 'Daljeet', '2024-08-03', '2024-08-03', 'Home Drop LLC', 'delivered', 'neutral', '+919815943018', 'elite', true, 'India', 'sandhudaljit94@gmail.com', NULL, 70800, 0, 'INR', '2024-08-03', '2024-08-08', 'Payoneer Bank', NULL, 'approved'),
(18, 'SUPLLC1040', 'Sharma Vishal Sahdevbhai', '2024-08-07', '2024-08-08', 'AmeriTrade LLC', 'delivered', 'critical', '+919601442239', 'llc', false, 'India', 'vs28917@gmail.com', NULL, 39000, 0, 'INR', '2024-08-07', '2024-08-08', 'WISE Bank', NULL, 'approved'),
(19, 'SUPLLC1007', 'Shaikh Shareef Ahemad', '2024-08-10', '2024-08-15', 'DropZone Market LLC', 'delivered', 'at_risk', '+918408061282', 'elite', true, 'India', 'shareef812@hotmail.com', NULL, 59000, 0, 'INR', '2024-08-10', '2024-08-15', 'Payoneer Bank', NULL, 'approved'),
(20, 'SUPLLC1041', 'Deepak Kumar', '2024-08-14', '2024-08-20', 'MacShop LLC', 'delivered', 'at_risk', '+918130745340', 'elite', true, 'India', 'Dkdagar11@gmail.com', NULL, 59999, 0, 'INR', '2024-08-14', '2024-08-20', 'WISE Bank', NULL, 'approved'),
(21, 'SUPLLC1010', 'Sachin', '2024-08-29', '2024-08-29', 'Trade Shelve LLC', 'delivered', 'at_risk', '+919990616194', 'elite', true, 'India', 'sachinchhabrra.91@gmail.com', NULL, 50500, 0, 'INR', '2024-08-29', '2024-08-30', 'WISE / Airwallex / Payoneer', 'Discount of Super 30', 'approved'),
(22, 'SUPLLC1034', 'SHAIKH INAMUL HAQUE MUSHTAQUE AHMED', '2024-08-30', '2024-08-30', 'Mahi Matrix LLC', 'delivered', 'neutral', '+917777971141', 'elite', true, 'India', 'sk.inamulhaque007@gmail.com', NULL, 60000, 0, 'INR', '2024-08-30', '2024-08-31', 'Payoneer Bank', 'Super 30 Discount', 'approved'),
(23, 'SUPLLC1037', 'Aneesh Kumar', '2024-09-04', '2024-09-04', 'Zerino Commerce LLC', 'delivered', 'neutral', '+918826778727', 'elite', true, 'India', 'kumar.aneesh@outlook.in', NULL, 60000, 0, 'INR', '2024-09-04', '2024-09-13', 'Payoneer Bank', 'Super 30 Discount', 'approved'),
(24, 'SUPLLC1014', 'Rashid Ali', '2024-09-10', '2024-09-10', 'Ecomintelligence LLC', 'delivered', 'neutral', '+447459324730', 'elite', true, 'Pakistan', 'rashid.ali657585@gmail.com', NULL, 60480, 0, 'INR', '2024-09-10', '2024-09-11', 'Payoneer Bank', NULL, 'approved'),
(25, 'SUPLLC1038', 'Ashish Nitin bhai Navadiya', '2024-09-14', '2024-09-14', 'Chillflex Innovations LLC', 'delivered', 'neutral', '+918153836604', 'elite', true, 'India', 'ashishnavadiya209@gmail.com', NULL, 60000, 0, 'INR', '2024-09-14', '2024-09-14', 'WISE Bank', 'Super 30 Discount', 'approved'),
(26, 'SUPLLC1044', 'Bishumita Moktan', '2024-09-17', '2024-09-17', 'Gaway Mik (Joyful Vision) LLC', 'delivered', 'neutral', '+919332422883', 'elite', true, 'India', 'bishumitamoktan@yahoo.com', NULL, 59999, 0, 'INR', '2024-09-17', '2024-09-17', 'Payoneer Bank', NULL, 'approved'),
(27, 'SUPLLC1033', 'Sonal Meshram', '2024-09-19', '2024-09-20', 'Snowdrop Group LLC', 'delivered', 'neutral', '+917709415934', 'elite', true, 'India', 'sonalmeshram.sitm@gmail.com', NULL, 66896, 0, 'INR', '2024-09-19', '2024-09-24', 'WISE Bank', NULL, 'approved'),
(28, 'SUPLLC1023', 'KRUPA SHAH', '2024-09-20', '2024-10-01', 'TrendEnvy LLC', 'delivered', 'neutral', '+918160299957', 'elite', true, 'India', 'aspiresacademy15@gmail.com', NULL, 60000, 0, 'INR', '2024-09-20', '2024-10-13', 'Payoneer Bank', NULL, 'approved'),
(29, 'SUPLLC1043', 'Mandeep', '2024-09-21', '2024-09-21', 'Mystik Alliance LLC', 'delivered', 'neutral', '+919773655667', 'elite', true, 'India', 'mandeepkaushik57@gmail.com', NULL, 50500, 0, 'INR', '2024-09-21', '2024-09-21', 'Payoneer Bank', NULL, 'approved'),
(30, 'SUPLLC1045', 'Pankaj Vasantkumar Bachhuka', '2024-09-21', '2024-09-20', 'HARP International LLC', 'delivered', 'neutral', '+919423091000', 'elite', true, 'India', 'happypankaj@gmail.com', NULL, 60000, 0, 'INR', '2024-09-21', '2024-09-20', 'Payoneer Bank', NULL, 'approved'),
(31, 'SUPLLC1042', 'RAKESH KUMAR BHOLA', '2024-09-25', '2024-09-27', 'Rakesh Overseas LLC', 'delivered', 'neutral', '+919811448646', 'elite', true, 'India', 'RAKESHBHOLA72@GMAIL.COM', NULL, 70500, 0, 'INR', '2024-09-25', '2024-09-27', 'Payoneer Bank/ WISE Bank', NULL, 'approved'),
(32, 'SUPLLC1029', 'BHAVIK DILIPBHAI RATHOD', '2024-09-28', '2024-09-28', 'Leosmith International LLC', 'delivered', 'neutral', '+918238048182', 'elite', true, 'India', 'BHAVIKDRATHOD@GMAIL.COM', NULL, 78938, 0, 'INR', '2024-09-28', '2024-10-03', 'Payoneer Bank / Mercury Bank', NULL, 'approved'),
(33, 'SUPLLC1031', 'AMIT GOVINDRAM MAKHIJA', '2024-09-28', '2024-09-28', 'Maktech International LLC', 'delivered', 'neutral', '+919328939414', 'elite', true, 'India', 'makhija.usa@gmail.com', NULL, 70800, 0, 'INR', '2024-09-28', '2024-09-30', 'Payoneer Bank/ Mercury Bank', NULL, 'approved'),
(34, 'SUPLLC1030', 'VIRANI MITKUMAR KANTILAL', '2024-09-30', '2024-10-01', 'Kurruki LLC', 'delivered', 'neutral', '+919023517716', 'elite', true, 'India', 'infinityexim23@gmail.com', NULL, 78938, 0, 'INR', '2024-09-30', '2024-10-01', 'Payoneer Bank / Mercury Bank', NULL, 'approved'),
(35, 'SUPLLC1032', 'Chovatiya Juliben Mansukhbhai', '2024-09-30', '2024-09-30', 'Zurach LLC', 'delivered', 'neutral', '+917984069007', 'elite', true, 'India', 'bhavinpatel3192@gmail.com', NULL, 78977.92, 0, 'INR', '2024-09-30', '2024-10-02', 'Payoneer Bank', NULL, 'approved'),

-- October 2024
(36, 'SUPLLC1027', 'Kalpesh Pravinbhai Parmar', '2024-10-03', '2024-10-04', 'HK EXPORTS MANAGEMENT LLC', 'delivered', 'neutral', '+918460153513', 'elite', true, 'India', 'Kalpeshparmar501@gmail.com', NULL, 66896, 0, 'INR', '2024-10-03', '2024-10-04', 'Payoneer Bank', NULL, 'approved'),
(37, 'SUPLLC1028', 'Dharmeshkumar Mohanlal Savaliya', '2024-10-04', '2024-10-04', 'Powercool refrigeration LLC', 'delivered', 'neutral', '+919824517186', 'elite', true, 'India', 'Vaayuandco07@gmail.com', NULL, 66896, 0, 'INR', '2024-10-04', '2024-10-06', 'Payoneer Bank', NULL, 'approved'),
(38, 'SUPLLC1026', 'Saurav Sota', '2024-10-07', '2024-10-07', 'Ts Sota LLC', 'delivered', 'neutral', '+447454100796', 'elite', true, 'United Kingdom', 'sauravsota99@yahoo.com', NULL, 78792, 0, 'INR', '2024-10-07', '2024-10-08', 'Payoneer Bank/ WISE Bank', NULL, 'approved'),
(39, 'SUPLLC1022', 'RAJ S SORATHIYA', '2024-10-08', '2024-10-09', 'KUBER INTERNATIONAL LLC', 'delivered', 'neutral', '+919726605578', 'elite', true, 'India', 'rspatel1913@gmail.com', NULL, 78938, 0, 'INR', '2024-10-08', '2024-10-19', 'Payoneer Bank/ Airwallex Bank', NULL, 'approved'),
(40, 'SUPLLC1025', 'Nikhil manani', '2024-10-09', '2024-10-10', 'DOLUXA LLC', 'delivered', 'neutral', '+918511010119', 'elite', true, 'India', 'nikhilmanani25@gmail.com', NULL, 78938, 0, 'INR', '2024-10-09', '2024-10-14', 'Payoneer Bank', NULL, 'approved'),
(41, 'SUPLLC1021', 'GAMARA KARAN JAYENDRABHAI', '2024-10-11', '2024-10-12', 'PARAM GLOBAL LLC', 'delivered', 'neutral', '+918511999911', 'elite', true, 'India', 'karan.gamara911@gmail.com', NULL, 78938, 0, 'INR', '2024-10-11', '2024-10-17', 'Payoneer Bank', NULL, 'approved'),
(42, 'SUPLLC1020', 'Radhika Aggarwal', '2024-10-12', '2024-10-12', 'Bhavam Bhavani LLC', 'delivered', 'neutral', '+919828488442', 'elite', true, 'India', 'agrawal.radhika3@gmail.com', NULL, 60000, 0, 'INR', '2024-10-12', '2024-10-18', 'Payoneer Bank', NULL, 'approved'),
(43, 'SUPLLC1024', 'Sabhadiya Sachin Vallabhbhai', '2024-10-17', '2024-10-17', 'Bag Pack with Us LLC', 'delivered', 'neutral', '+917567492575', 'elite', true, 'India', 'sabhadiyasachin@gmail.com', NULL, 78977.92, 0, 'INR', '2024-10-17', '2024-10-19', 'Payoneer Bank', NULL, 'approved'),
(44, 'SUPLLC1018', 'Abdullah Amdani', '2024-10-21', '2024-10-23', 'AA International LLC', 'delivered', 'neutral', '+919265711682', 'elite', true, 'India', 'Abdullahamdani34@gmail.com', NULL, 78938, 0, 'INR', '2024-10-21', '2024-10-24', 'Mercury Bank', NULL, 'approved'),
(45, 'SUPLLC1019', 'Sana Ahmad', '2024-10-22', '2024-10-23', 'EFS Style US', 'delivered', 'neutral', '+447368466120', 'elite', true, 'United Kingdom', 'efsstyleukltd@gmail.com', NULL, 47881.76, 0, 'INR', '2024-10-22', '2024-10-23', 'Wise Bank', NULL, 'approved'),
(46, 'SUPLLC1046', 'Saurabh Daga', '2024-10-17', '2024-11-04', 'Quorify LLC', 'delivered', 'neutral', '+919810301956', 'elite', true, 'India', 'sdaga.pi@gmail.com', NULL, 70000, 0, 'INR', '2024-11-15', '2024-11-15', 'Mercury Bank', NULL, 'approved'),
(47, 'SUPLLC1047', 'Arpit Jain', '2024-10-12', '2024-10-12', 'JAIN INTERNATIONAL LLC', 'delivered', 'neutral', '+919506984473', 'elite', true, 'India', '1008arpitjain@gmail.com', NULL, 66896, 0, 'INR', '2024-10-12', '2025-01-17', 'Payoneer Bank', NULL, 'approved'),
(48, 'SUPLLC1048', 'REDDY SAMPREETH', '2024-10-20', '2024-11-19', 'Everbright solutions LLC', 'delivered', 'neutral', '+916305591788', 'llc', false, 'India', 'sampreethnbs@gmail.com', NULL, 41000, 0, 'INR', '2024-11-20', '2024-11-21', 'Payoneer Bank', NULL, 'approved'),
(49, 'SUPLLC1049', 'SUHEL SHAAN BAPU MANCHI SHEIKH', '2024-10-29', '2024-10-29', 'Lunar Peak LLC', 'delivered', 'neutral', '+917240023006', 'elite', true, 'India', 'shaanbaapu@gmail.com', NULL, 78938, 0, 'INR', '2024-10-28', '2024-11-01', 'Payoneer Bank', NULL, 'approved'),
(50, 'SUPLLC1050', 'AMITKUMAR R BARASIYA', '2024-10-21', '2024-12-02', 'Saura Life Science LLC', 'delivered', 'neutral', '+919824232565', 'elite', true, 'India', 'sauralifescience@gmail.com', NULL, 66900, 0, 'INR', '2024-12-02', '2024-12-11', 'Wise Bank', NULL, 'approved'),
(51, 'SUPLLC1051', 'Alish Shaileshbhai Malaviya', '2024-10-15', '2024-10-15', 'AUTONNOMY GLOBAL LLC', 'under_banking', 'neutral', '+919067032920', 'elite', true, 'India', '5aalishmalaviya@gmail.com', NULL, 50500, 0, 'INR', '2024-10-15', '2025-01-28', NULL, NULL, 'under_review'),
(52, 'SUPLLC1052', 'Miteshkumar narayanbhai buchiya', '2024-10-28', '2024-10-28', 'Helpygoods LLC', 'delivered', 'neutral', '+919033648393', 'elite', true, 'India', 'miteshmaheshwari45@gmail.com', NULL, 78977.92, 0, 'INR', '2024-10-28', '2024-10-30', 'WISE Bank', NULL, 'approved'),
(53, 'SUPLLC1053', 'Gondaliya Ashok Kumar Chagan Bhai', '2024-10-07', '2024-12-21', 'VISBY LLC', 'delivered', 'neutral', '+918849988646', 'elite', true, 'India', 'ashokgondaliya16@gmail.com', NULL, 78977.92, 0, 'INR', '2024-12-21', '2024-12-27', 'Payoneer Bank', NULL, 'approved'),
(54, 'SUPLLC1054', 'Sidhant', '2024-10-30', '2024-11-04', 'Edge Cart LLC', 'delivered', 'neutral', '+14163006035', 'elite', true, 'Canada', 'Slgtra4@gmail.com', NULL, 74990, 0, 'INR', '2024-11-07', '2024-11-07', 'Mercury Bank', NULL, 'approved'),
(55, 'SUPLLC1055', 'Nitesh Patidar', '2024-08-14', '2024-08-16', 'NBR Overseas LLC', 'delivered', 'neutral', '+918770741079', 'elite', true, 'India', 'nitesh7579@gmail.com', NULL, 70800, 0, 'INR', '2024-08-16', '2025-02-24', 'Mercury Bank', NULL, 'approved'),

-- November 2024
(56, 'SUPLLC1056', 'ashish chandra pappu', '2024-11-08', '2024-11-09', 'Maxim One Group LLC', 'delivered', 'neutral', '+919952047534', 'elite', true, 'USA', 'ashishchandrapappu@gmail.com', NULL, 74990, 0, 'INR', '2024-11-09', '2024-11-16', 'Mercury Bank', NULL, 'approved'),
(57, 'SUPLLC1057', 'Sonal Modi', '2024-11-05', '2024-11-07', 'Kanak LLC', 'delivered', 'neutral', '+918559995503', 'elite', true, 'India', 'riasonal2010@gmail.com', NULL, 59998, 0, 'INR', '2024-11-07', '2024-11-09', 'Mercury Bank', NULL, 'approved'),
(58, 'SUPLLC1058', 'Sandip Tanaji Raut', '2024-11-29', '2024-11-29', 'Shoply LLC', 'delivered', 'neutral', '+918866705668', 'elite', true, 'India', 'sandipraut9098@gmail.com', NULL, 66896, 0, 'INR', '2024-11-29', '2024-11-30', NULL, NULL, 'approved'),
(59, 'SUPLLC1059', 'Rajni kant', '2024-11-15', '2024-11-16', 'ARD Techtronics LLC', 'delivered', 'neutral', '+919881423000', 'elite', true, 'India', '2.rajnikant@gmail.com', NULL, 78938, 0, 'INR', '2024-11-17', '2024-11-19', NULL, NULL, 'approved'),
(60, 'SUPLLC1060', 'Sonu Choudhary', '2024-11-27', '2024-11-27', 'Connectcart LLC', 'delivered', 'neutral', '+917835955566', 'elite', true, 'India', 'Mokway555@gmail.com', NULL, 68937.28, 0, 'INR', '2024-11-27', '2024-12-05', 'Payoneer Bank', NULL, 'approved'),

-- December 2024
(61, 'SUPLLC1061', 'Amrit singh', '2024-12-04', '2024-12-04', 'JC Cart LLC', 'delivered', 'neutral', '+919368204910', 'elite', true, 'India', 'amritsinghusa11@gmail.com', NULL, 60003, 0, 'INR', '2024-12-04', '2024-12-09', 'Mercury Bank', NULL, 'approved'),
(62, 'SUPLLC1062', 'Deep Gajera', '2024-12-04', '2024-12-04', 'Jetix Exim LLC', 'delivered', 'neutral', '+919510203032', 'elite', true, 'India', 'Jetixexim@gmail.com', NULL, 78938, 0, 'INR', '2024-12-04', '2024-12-05', 'Mercury Bank', NULL, 'approved'),
(63, 'SUPLLC1063', 'Tirth Kishorbhai Ranpariya', '2024-12-10', '2024-12-10', 'Anjani LLC', 'delivered', 'neutral', '+919638389601', 'elite', true, 'India', 'tirthranpariya1041@gmail.com', NULL, 78938, 0, 'INR', '2024-12-10', '2024-12-16', 'WISE Bank', NULL, 'approved'),
(64, 'SUPLLC1064', 'Dayal Singh Satsangi', '2024-12-16', '2024-12-17', 'Luminate LLC', 'delivered', 'neutral', '+919457675359', 'elite', true, 'India', 'satsangidayal96@gmail.com', NULL, 65000, 0, 'INR', '2024-12-17', '2024-12-18', 'Mercury Bank', NULL, 'approved'),
(65, 'SUPLLC1065', 'Ravi Kumar Yadav', '2024-12-05', '2024-12-05', 'DPSY LLC', 'delivered', 'neutral', '+919013248550', 'llc', false, 'India', 'ravigsk@gmail.com', NULL, 44873, 0, 'INR', '2024-12-05', '2024-12-19', 'Mercury Bank', NULL, 'approved'),
(66, 'SUPLLC1066', 'Sunil kumar k Reddy', '2024-12-19', '2024-12-19', 'LEGEND E-COMMERCE LLC', 'delivered', 'neutral', '+919886502727', 'elite', true, 'India', 'sunilkumar.k59@gmail.com', NULL, 78938, 0, 'INR', '2024-12-19', '2024-12-31', NULL, NULL, 'approved'),
(67, 'SUPLLC1067', 'Ahmad Habib Soudagar', '2024-12-21', '2024-12-21', 'ShopHere LLC', 'delivered', 'neutral', '+4917624445210', 'elite', true, 'Germany', 'sehanahmed101@gmail.com', NULL, 61310.47, 0, 'INR', '2024-12-21', '2024-12-26', 'Payoneer Bank', NULL, 'approved'),
(68, 'SUPLLC1068', 'ROHIT PANCHAL', '2024-12-23', '2024-12-23', 'KENIL IMPEX LLC', 'delivered', 'neutral', '+919925016568', 'elite', true, 'India', 'Kenilimpex3007@gmail.com', NULL, 66896, 0, 'INR', '2024-12-23', '2024-12-28', 'Payoneer Bank', NULL, 'approved'),
(69, 'SUPLLC1069', 'Jagroop', '2024-12-28', '2024-12-28', 'Skyward Trade LLC', 'delivered', 'neutral', '+601111851544', 'elite', true, 'Malaysia', 'mrroop0@gmail.com', NULL, 66520, 0, 'INR', '2024-12-28', '2025-01-09', NULL, NULL, 'approved'),
(70, 'SUPLLC1070', 'Jasmine', '2024-12-31', '2024-12-30', 'Xinon LLC', 'delivered', 'neutral', '+15193019157', 'elite', true, 'Canada', 'jasminekaur10909@gmail.com', NULL, 68323, 0, 'INR', '2024-12-31', '2024-12-31', 'Mercury Bank', NULL, 'approved'),

-- January 2025+
(71, 'SUPLLC1071', 'Tanmay Shah', '2025-01-05', '2025-01-06', 'Label Le Market LLC', 'delivered', 'neutral', '+917984506099', 'elite', true, 'India', 'ibctanmayshah@gmail.com', NULL, 64500, 0, 'INR', '2025-01-06', '2025-01-10', 'Mercury Bank', NULL, 'approved'),
(72, 'SUPLLC1072', 'Sandip Pramanik', '2025-01-04', '2025-01-06', 'Flash Shelf LLC', 'delivered', 'neutral', '+919997566772', 'elite', true, 'India', 'sandip17pramanik@gmail.com', NULL, 70801, 0, 'INR', '2025-01-06', '2025-01-27', 'Payoneer Bank', NULL, 'approved'),
(73, 'SUPLLC1073', 'Krishna Gupta', '2025-01-08', '2025-01-09', 'EverCart LLC', 'delivered', 'neutral', '+918827859925', 'elite', true, 'India', '88893380krishna@gmail.com', NULL, 68585, 0, 'INR', '2025-01-09', '2025-01-16', 'Payoneer Bank', NULL, 'approved'),
(74, 'SUPLLC1074', 'Parth Patel', '2025-01-09', '2025-01-10', NULL, 'onboarded', 'neutral', '+13437778328', 'elite', true, 'Canada', 'parthspatel.canada@gmail.com', NULL, 68622.27, 0, 'INR', '2025-01-10', NULL, NULL, NULL, 'not_started'),
(75, 'SUPLLC1075', 'Rajiv verma', '2025-01-11', '2025-01-13', 'Luxury Deals Hub LLC', 'delivered', 'neutral', '+16472917116', 'elite', true, 'Canada', 'luxurydealshub1@gmail.com', NULL, 78936, 0, 'INR', '2025-01-13', '2025-01-14', 'Mercury Bank', NULL, 'approved'),
(76, 'SUPLLC1076', 'Shivam Choudhary', '2025-01-12', '2025-07-15', 'SyRock LLC', 'delivered', 'neutral', '+919648364712', 'elite', true, 'India', 'chaudharyshivam4712@gmail.com', NULL, 60000, 0, 'INR', '2025-07-15', '2025-09-12', 'Mercury Bank', NULL, 'approved'),
(77, 'SUPLLC1077', 'Gunjan Bansal ( Rohit Geol )', '2025-01-12', '2025-01-18', 'Siya LLC', 'delivered', 'neutral', '+918222865573', 'elite', true, 'India', 'gunjanbansal1708@gmail.com', NULL, 73888, 0, 'INR', '2025-01-18', '2025-01-22', 'Payoneer Bank', NULL, 'approved'),
(78, 'SUPLLC1078', 'Rahul Gupta', '2025-01-13', NULL, NULL, 'llc_booked', 'neutral', '+919650422727', 'elite', true, 'Portugal', 'rdpworka@gmail.com', NULL, 2300, 70986, 'INR', NULL, NULL, NULL, NULL, 'not_started'),
(79, 'SUPLLC1079', 'Diwakar Singh', '2025-01-16', '2025-01-16', 'SM Wholesale LLC', 'delivered', 'neutral', '+919022577042', 'elite', true, 'India', 'shopmaniaretail@gmail.com', NULL, 60000, 0, 'INR', '2025-01-16', '2025-01-16', 'Mercury Bank', NULL, 'approved'),
(80, 'SUPLLC1080', 'Vishwa Pratap', '2025-01-16', '2025-01-16', 'EliteCart LLC', 'delivered', 'neutral', '+919716135065', 'elite', true, 'India', 'pvishwawork@gmail.com', NULL, 62100, 0, 'INR', '2025-01-16', '2025-01-20', 'Mercury Bank', NULL, 'approved'),
(81, 'SUPLLC1081', 'Aman Gupta', '2025-01-18', '2025-01-18', 'Dolphi Media LLC', 'delivered', 'neutral', '+917987493922', 'llc', false, 'India', 'Gaman3678@gmail.com', NULL, 49264.07, 0, 'INR', '2025-01-18', '2025-01-20', 'Mercury Bank', NULL, 'approved'),
(82, 'SUPLLC1082', 'Sanjana Islash', '2025-01-21', '2025-01-21', 'Palmora LLC', 'delivered', 'neutral', '+918288022724', 'llc', false, 'India', 'sanjanaislash18@gmail.com', NULL, 47000, 0, 'INR', '2025-01-21', '2025-01-22', 'Payoneer Bank', NULL, 'approved'),
(83, 'SUPLLC1083', 'SHRUTI RAJKUMAR HALE', '2025-01-23', '2025-01-24', 'FUSION CONSULT LLC', 'under_boi', 'neutral', '+918329923427', 'elite', true, 'India', 'aditya2537m@gmail.com', NULL, 69126, 0, 'INR', '2025-01-23', '2025-01-31', NULL, NULL, 'not_started'),
(84, 'SUPLLC1084', 'Aditya Prakash', '2025-01-28', '2025-01-28', 'FusionVibe LLC', 'delivered', 'neutral', '+919582097480', 'elite', true, 'India', 'adi.prakash22@gmail.com', NULL, 67750, 0, 'INR', '2025-01-28', '2025-01-30', 'Mercury Bank', NULL, 'approved');

-- Continue with more clients in subsequent seed file or append more INSERT statements

-- Clean up helper functions
DROP FUNCTION IF EXISTS parse_llc_status(TEXT);
DROP FUNCTION IF EXISTS parse_llc_health(TEXT);
DROP FUNCTION IF EXISTS parse_llc_plan(TEXT);
DROP FUNCTION IF EXISTS parse_inr_amount(TEXT);
