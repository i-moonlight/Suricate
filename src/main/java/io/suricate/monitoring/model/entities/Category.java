/*
 *
 *  * Copyright 2012-2018 the original author or authors.
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *      http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package io.suricate.monitoring.model.entities;

import io.suricate.monitoring.model.entities.generic.AbstractAuditingEntity;
import lombok.*;
import org.hibernate.search.annotations.Field;
import org.hibernate.search.annotations.Indexed;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Category entity
 *
 */
@Entity
@Indexed
@Getter
@Setter
@NoArgsConstructor
public class Category extends AbstractAuditingEntity<Long> {

    /**
     * The category id
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The category name
     */
    @Column(nullable = false)
    @Field
    private String name;

    /**
     * The technical name
     */
    @Column(nullable = false, unique = true)
    private String technicalName;

    /**
     * The image related to this category
     */
    @OneToOne(cascade = CascadeType.REMOVE)
    private Asset image;

    /**
     * The list of widgets in this category
     */
    @OneToMany(mappedBy = "category")
    private List<Widget> widgets;

    /**
     * The associated categories for this configuration
     */
    @OneToMany(mappedBy = "category", cascade = CascadeType.REMOVE)
    private List<CategoryParameter> configurations;
}
