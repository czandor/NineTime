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

ALTER TABLE `inforequests`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ninetime_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `watchtoken_2` (`watchtoken`,`platform`,`slot`),
  ADD KEY `platform` (`platform`),
  ADD KEY `slot` (`slot`),
  ADD KEY `watchtoken` (`watchtoken`);

ALTER TABLE `inforequests`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

ALTER TABLE `ninetime_settings`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `weather_cache` (
  `cache_key` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `payload` mediumtext NOT NULL,
  `updated_at` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`cache_key`),
  KEY `updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
