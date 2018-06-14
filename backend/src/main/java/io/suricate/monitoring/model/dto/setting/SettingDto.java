/*
 * Copyright 2012-2018 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.suricate.monitoring.model.dto.setting;

import io.suricate.monitoring.model.enums.SettingDataType;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Setting DTO used for REST communication
 */
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@ToString
public class SettingDto {
    /**
     * The setting id
     */
    private Long id;

    /**
     * The setting name/description
     */
    private String description;

    /**
     * Tell if the settings have constrained values
     */
    private boolean constrained;

    /**
     * The setting data type
     */
    private SettingDataType dataType;

    /**
     * Hold the possible values (if we have a select setting for example)
     */
    private List<AllowedSettingValueDto> allowedSettingValue = new ArrayList<>();
}
