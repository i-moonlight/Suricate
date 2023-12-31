package com.michelin.suricate.services.specifications;

import com.michelin.suricate.model.entities.Category;
import com.michelin.suricate.model.entities.Category_;


/**
 * Category search specification.
 */
public class CategorySearchSpecification extends AbstractSearchSpecification<Category> {

    /**
     * Constructor.
     *
     * @param search The string to search
     */
    public CategorySearchSpecification(final String search) {
        super(search, Category_.name);
    }
}
