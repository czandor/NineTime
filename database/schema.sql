-- NineTime schema only. No production data or credentials.
SET NAMES utf8mb4;

CREATE TABLE `colors_notfit` (
  `bg_colorid` int NOT NULL,
  `bg_disabled` int NOT NULL,
  `disabled_text_colorids` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE `inforequests` (
  `id` int UNSIGNED NOT NULL,
  `watchtoken` varchar(100) NOT NULL,
  `platform` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `inserted` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `lang` varchar(2) NOT NULL,
  `battery` int NOT NULL,
  `steps` int NOT NULL,
  `hrbpm_avg` int NOT NULL,
  `hrbpm_min` int NOT NULL,
  `hrbpm_max` int NOT NULL,
  `from_time` int NOT NULL,
  `h24` int NOT NULL,
  `data` varchar(100) NOT NULL,
  `pos` text NOT NULL,
  `test` int NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE `ninetime_settings` (
  `id` int UNSIGNED NOT NULL,
  `watchtoken` varchar(100) NOT NULL,
  `platform` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `slot` int NOT NULL,
  `name` varchar(20) NOT NULL,
  `jsondata` text NOT NULL,
  `inserted` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE `weather_error_log` (
  `id` int UNSIGNED NOT NULL,
  `provider` varchar(10) NOT NULL,
  `ip` varchar(100) NOT NULL,
  `browser` varchar(255) NOT NULL,
  `get` varchar(255) NOT NULL,
  `datum` datetime NOT NULL,
  `error` varchar(255) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE `weather_usage` (
  `id` int UNSIGNED NOT NULL,
  `minute` int UNSIGNED NOT NULL COMMENT 'US/Eastern',
  `day` int UNSIGNED NOT NULL COMMENT 'US/Eastern',
  `month` int UNSIGNED NOT NULL DEFAULT '0' COMMENT 'US/Eastern',
  `provider` enum('wu','owm','czandor') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `apikey` varchar(100) NOT NULL,
  `datum_insert` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `counter` int UNSIGNED NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE `weather_usage_log` (
  `id` int UNSIGNED NOT NULL,
  `provider` varchar(10) NOT NULL,
  `ip` varchar(100) NOT NULL,
  `browser` varchar(255) NOT NULL,
  `get` varchar(255) NOT NULL,
  `datum` datetime NOT NULL,
  `error` varchar(255) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

CREATE TABLE `weather_woeids` (
  `id` int UNSIGNED NOT NULL,
  `woeid` int NOT NULL,
  `latitude` double(11,8) NOT NULL,
  `longitude` double(11,8) NOT NULL,
  `updated` datetime DEFAULT NULL,
  `update_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

ALTER TABLE `inforequests`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ninetime_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `watchtoken_2` (`watchtoken`,`platform`,`slot`),
  ADD KEY `platform` (`platform`),
  ADD KEY `slot` (`slot`),
  ADD KEY `watchtoken` (`watchtoken`);

ALTER TABLE `weather_error_log`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `weather_usage`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `minute` (`minute`,`provider`,`apikey`),
  ADD KEY `counter` (`counter`),
  ADD KEY `day` (`day`),
  ADD KEY `month` (`month`),
  ADD KEY `provider` (`provider`),
  ADD KEY `apikey` (`apikey`);

ALTER TABLE `weather_usage_log`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `weather_woeids`
  ADD PRIMARY KEY (`id`),
  ADD KEY `latitude` (`latitude`,`longitude`),
  ADD KEY `updated` (`updated`),
  ADD KEY `update_count` (`update_count`);

ALTER TABLE `inforequests`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

ALTER TABLE `ninetime_settings`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

ALTER TABLE `weather_error_log`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

ALTER TABLE `weather_usage`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

ALTER TABLE `weather_usage_log`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

ALTER TABLE `weather_woeids`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
