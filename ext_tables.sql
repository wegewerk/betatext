#
# Table structure for table 'tx_webetatext_text'
#
CREATE TABLE tx_webetatext_text (
	uid int(11) NOT NULL auto_increment,
	pid int(11) DEFAULT '0' NOT NULL,
	tstamp int(11) DEFAULT '0' NOT NULL,
	crdate int(11) DEFAULT '0' NOT NULL,
	cruser_id int(11) DEFAULT '0' NOT NULL,
	fe_cruser_id int(11) DEFAULT '0' NOT NULL,
	deleted tinyint(4) DEFAULT '0' NOT NULL,
	hidden tinyint(4) DEFAULT '0' NOT NULL,

	TextID tinytext,
	Version int(11) DEFAULT '1' NOT NULL,
	Content text,
	ContentRaw text,

	PRIMARY KEY (uid),
	KEY parent (pid)
);



#
# Table structure for table 'tx_webetatext_comment'
#
CREATE TABLE tx_webetatext_comment (
	uid int(11) NOT NULL auto_increment,
	pid int(11) DEFAULT '0' NOT NULL,
	tstamp int(11) DEFAULT '0' NOT NULL,
	crdate int(11) DEFAULT '0' NOT NULL,
	cruser_id int(11) DEFAULT '0' NOT NULL,
	fe_cruser_id int(11) DEFAULT '0' NOT NULL,
	deleted tinyint(4) DEFAULT '0' NOT NULL,
	hidden tinyint(4) DEFAULT '0' NOT NULL,

	TextID tinytext,
	TextVersion int(11) DEFAULT '0' NOT NULL,
	Content text,
	CommentedText text,
	StartIndex int(11) DEFAULT '0' NOT NULL,
	EndIndex int(11) DEFAULT '0' NOT NULL,

	PRIMARY KEY (uid),
	KEY parent (pid)
);



#
# Table structure for table 'tx_webetatext_vote'
#
CREATE TABLE tx_webetatext_vote (
	uid int(11) NOT NULL auto_increment,
	pid int(11) DEFAULT '0' NOT NULL,
	tstamp int(11) DEFAULT '0' NOT NULL,
	crdate int(11) DEFAULT '0' NOT NULL,
	cruser_id int(11) DEFAULT '0' NOT NULL,
	fe_cruser_id int(11) DEFAULT '0' NOT NULL,
	deleted tinyint(4) DEFAULT '0' NOT NULL,
	hidden tinyint(4) DEFAULT '0' NOT NULL,

	CommentID int(11) DEFAULT '0' NOT NULL,
	Value tinyint(4) DEFAULT '0' NOT NULL,

	PRIMARY KEY (uid),
	KEY parent (pid)
);

CREATE TABLE tx_webetatext_process (
	uid int(11) NOT NULL auto_increment,
	pid int(11) DEFAULT '0' NOT NULL,
	tstamp int(11) DEFAULT '0' NOT NULL,
	crdate int(11) DEFAULT '0' NOT NULL,
	sort int(11) DEFAULT '0' NOT NULL,
	cruser_id int(11) DEFAULT '0' NOT NULL,
	deleted tinyint(4) DEFAULT '0' NOT NULL,
	hidden tinyint(4) DEFAULT '0' NOT NULL,

	StepIndex varchar(10) DEFAULT '0' NOT NULL,
    IsCurrent tinyint(4) DEFAULT '0' NOT NULL,
	Content text,
	Link text,

	PRIMARY KEY (uid),
	KEY parent (pid)
);


#
# Table structure for table 'fe_users'
#
CREATE TABLE fe_users (
	tx_webetatext_logo blob NOT NULL,
    tx_webetatext_verified tinyint(4) DEFAULT '0' NOT NULL,
    tx_webetatext_verification_requested tinyint(4) DEFAULT '0' NOT NULL    
);



#
# Table structure for table 'pages'
#
CREATE TABLE pages (
    tx_webetatext_enable tinyint(4) DEFAULT '1' NOT NULL,
    tx_webetatext_infomail_to varchar(255) DEFAULT '' NOT NULL,
    tx_webetatext_pstep_title varchar(255) DEFAULT '' NOT NULL
);