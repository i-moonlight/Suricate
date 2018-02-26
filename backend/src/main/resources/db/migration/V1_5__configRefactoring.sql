ALTER TABLE user MODIFY token VARCHAR(500);
ALTER TABLE user DROP COLUMN token;
ALTER TABLE user ADD COLUMN firstname VARCHAR(250);
ALTER TABLE user ADD COLUMN lastname VARCHAR(250);
ALTER TABLE user ADD COLUMN email VARCHAR(250);
ALTER TABLE user ADD COLUMN password VARCHAR(250);
ALTER TABLE user ADD COLUMN auth_mode VARCHAR(20) NOT NULL;
ALTER TABLE asset ADD COLUMN created_by VARCHAR(255) NOT NULL;
ALTER TABLE asset ADD COLUMN created_date DATETIME NOT NULL;
ALTER TABLE asset ADD COLUMN last_modified_by VARCHAR(255);
ALTER TABLE asset CHANGE COLUMN last_update_date last_modified_date DATETIME;
ALTER TABLE category ADD COLUMN created_by VARCHAR(255) NOT NULL;
ALTER TABLE category ADD COLUMN created_date DATETIME NOT NULL;
ALTER TABLE category ADD COLUMN last_modified_by VARCHAR(255);
ALTER TABLE category ADD COLUMN last_modified_date DATETIME;
ALTER TABLE configuration ADD COLUMN created_by VARCHAR(255) NOT NULL;
ALTER TABLE configuration ADD COLUMN created_date DATETIME NOT NULL;
ALTER TABLE configuration ADD COLUMN last_modified_by VARCHAR(255);
ALTER TABLE configuration ADD COLUMN last_modified_date DATETIME;
ALTER TABLE library ADD COLUMN created_by VARCHAR(255) NOT NULL;
ALTER TABLE library ADD COLUMN created_date DATETIME NOT NULL;
ALTER TABLE library ADD COLUMN last_modified_by VARCHAR(255);
ALTER TABLE library ADD COLUMN last_modified_date DATETIME;
ALTER TABLE project ADD COLUMN created_by VARCHAR(255) NOT NULL;
ALTER TABLE project ADD COLUMN created_date DATETIME NOT NULL;
ALTER TABLE project ADD COLUMN last_modified_by VARCHAR(255);
ALTER TABLE project ADD COLUMN last_modified_date DATETIME;
ALTER TABLE project_widget ADD COLUMN created_by VARCHAR(255) NOT NULL;
ALTER TABLE project_widget ADD COLUMN created_date DATETIME NOT NULL;
ALTER TABLE project_widget ADD COLUMN last_modified_by VARCHAR(255);
ALTER TABLE project_widget ADD COLUMN last_modified_date DATETIME;
ALTER TABLE widget ADD COLUMN created_by VARCHAR(255) NOT NULL;
ALTER TABLE widget ADD COLUMN created_date DATETIME NOT NULL;
ALTER TABLE widget ADD COLUMN last_modified_by VARCHAR(255);
ALTER TABLE widget ADD COLUMN last_modified_date DATETIME;
ALTER TABLE widget_param ADD COLUMN created_by VARCHAR(255) NOT NULL;
ALTER TABLE widget_param ADD COLUMN created_date DATETIME NOT NULL;
ALTER TABLE widget_param ADD COLUMN last_modified_by VARCHAR(255);
ALTER TABLE widget_param ADD COLUMN last_modified_date DATETIME;
ALTER TABLE widget_param_value ADD COLUMN created_by VARCHAR(255) NOT NULL;
ALTER TABLE widget_param_value ADD COLUMN created_date DATETIME NOT NULL;
ALTER TABLE widget_param_value ADD COLUMN last_modified_by VARCHAR(255);
ALTER TABLE widget_param_value ADD COLUMN last_modified_date DATETIME;



