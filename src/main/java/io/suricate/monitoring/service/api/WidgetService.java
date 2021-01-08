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

package io.suricate.monitoring.service.api;

import io.suricate.monitoring.model.dto.api.widget.WidgetRequestDto;
import io.suricate.monitoring.model.dto.nashorn.WidgetVariableResponse;
import io.suricate.monitoring.model.entity.Library;
import io.suricate.monitoring.model.entity.WidgetConfiguration;
import io.suricate.monitoring.model.entity.widget.*;
import io.suricate.monitoring.model.enums.WidgetAvailabilityEnum;
import io.suricate.monitoring.repository.WidgetRepository;
import io.suricate.monitoring.service.CacheService;
import io.suricate.monitoring.service.specification.WidgetSearchSpecification;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Widget service
 */
@Service
public class WidgetService {
    /**
     * Class logger
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(WidgetService.class);

    /**
     * Configuration Service
     */
    private final WidgetConfigurationService widgetConfigurationService;

    /**
     * Cache service
     */
    private final CacheService cacheService;

    /**
     * Asset repository
     */
    private final AssetService assetService;

    /**
     * Widget repository
     */
    private final WidgetRepository widgetRepository;

    /**
     * Category repository
     */
    private final CategoryService categoryService;

    /**
     * Constructor
     *
     * @param widgetRepository           The widget repository
     * @param categoryService            The category service
     * @param widgetConfigurationService The configuration service
     * @param cacheService               The cache service
     * @param assetService               The asset service
     */
    @Autowired
    public WidgetService(final WidgetRepository widgetRepository,
                         final CategoryService categoryService,
                         final WidgetConfigurationService widgetConfigurationService,
                         final CacheService cacheService,
                         final AssetService assetService) {
        this.widgetRepository = widgetRepository;
        this.categoryService = categoryService;
        this.widgetConfigurationService = widgetConfigurationService;
        this.cacheService = cacheService;
        this.assetService = assetService;
    }

    /**
     * Return every widgets order by category name
     *
     * @return The list of widgets order by category name
     */
    @Transactional
    public Page<Widget> getAll(String search, Pageable pageable) {
        return widgetRepository.findAll(new WidgetSearchSpecification(search), pageable);
    }

    /**
     * Find a widget by id
     *
     * @param id The widget id
     * @return The related widget
     */
    public Widget findOne(final Long id) {
        Optional<Widget> widgetOptional = widgetRepository.findById(id);
        return widgetOptional.orElse(null);
    }

    /**
     * Get every widgets for a category
     *
     * @param categoryId The category id used for found widgets
     * @return The list of related widgets
     */
    @Transactional
    public Optional<List<Widget>> getWidgetsByCategory(final Long categoryId) {
        List<Widget> widgets = widgetRepository.findAllByCategory_IdOrderByNameAsc(categoryId);

        if (widgets == null || widgets.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(widgets);
    }

    /**
     * Get the parameters of the category linked with the widget
     *
     * @param widget The widget
     * @return The related global configuration
     */
    public List<WidgetParam> getCategoryParametersFromWidget(final Widget widget) {
        Optional<List<WidgetConfiguration>> configurationsOptional = widgetConfigurationService.getConfigurationForCategory(widget.getCategory().getId());

        return configurationsOptional
            .map(configurations -> configurations.stream().map(WidgetConfigurationService::initParamFromConfiguration).collect(Collectors.toList()))
            .orElseGet(ArrayList::new);
    }

    /**
     * Return the full list of parameters of a widget including the parameters of the widget
     * and the global parameters of the category
     *
     * @param widget The widget
     * @return A list of parameters
     */
    @Transactional
    public List<WidgetParam> getWidgetParametersWithCategoryParameters(final Widget widget) {
        List<WidgetParam> widgetParameters = new ArrayList<>(widget.getWidgetParams());
        widgetParameters.addAll(getCategoryParametersFromWidget(widget));

        return widgetParameters;
    }

    /**
     * Get the list of widget parameters
     *
     * @param widget The widget
     * @return The list of widget parameters
     */
    @Transactional
    public List<WidgetVariableResponse> getWidgetParametersForNashorn(final Widget widget) {
        List<WidgetVariableResponse> widgetVariableResponses = new ArrayList<>();

        List<WidgetParam> widgetParameters = getWidgetParametersWithCategoryParameters(widget);

        for (WidgetParam widgetParameter : widgetParameters) {
            WidgetVariableResponse widgetVariableResponse = new WidgetVariableResponse();
            widgetVariableResponse.setName(widgetParameter.getName());
            widgetVariableResponse.setDescription(widgetParameter.getDescription());
            widgetVariableResponse.setType(widgetParameter.getType());
            widgetVariableResponse.setDefaultValue(widgetParameter.getDefaultValue());

            if (widgetVariableResponse.getType() != null) {
                switch (widgetVariableResponse.getType()) {
                    case COMBO:

                    case MULTIPLE:
                        widgetVariableResponse.setValues(getWidgetParamValuesAsMap(widgetParameter.getPossibleValuesMap()));
                        break;

                    default:
                        widgetVariableResponse.setData(StringUtils.trimToNull(widgetParameter.getDefaultValue()));
                        break;
                }
            }

            widgetVariableResponses.add(widgetVariableResponse);
        }

        return widgetVariableResponses;
    }

    /**
     * Get the widget param list as a Map
     *
     * @param widgetParamValues The list of the widget param values
     * @return The list as a Map<String, String>
     */
    public Map<String, String> getWidgetParamValuesAsMap(List<WidgetParamValue> widgetParamValues) {
        return widgetParamValues
            .stream()
            .collect(Collectors.toMap(WidgetParamValue::getJsKey, WidgetParamValue::getValue));
    }

    /**
     * Update a widget
     *
     * @param widgetId         The widget id to update
     * @param widgetRequestDto The object that holds changes
     * @return The widget update
     */
    public Optional<Widget> updateWidget(final Long widgetId, final WidgetRequestDto widgetRequestDto) {
        if (!widgetRepository.existsById(widgetId)) {
            return Optional.empty();
        }

        Widget widgetToBeModified = findOne(widgetId);
        widgetToBeModified.setWidgetAvailability(widgetRequestDto.getWidgetAvailability());

        return Optional.of(widgetRepository.save(widgetToBeModified));
    }


    /**
     * Update categories and widgets in database with the new list
     *
     * @param list       The list of categories + widgets
     * @param mapLibrary The libraries
     * @param repository The Git Repository
     */
    @Transactional
    public void updateWidgetInDatabase(List<Category> list, Map<String, Library> mapLibrary, final Repository repository) {
        for (Category category : list) {
            categoryService.addOrUpdateCategory(category);

            // Create/update widgets
            addOrUpdateWidgets(category, category.getWidgets(), mapLibrary, repository);
        }
        cacheService.clearAllCache();
    }

    /**
     * Add or update a list of widgets in database
     *
     * @param category   The category
     * @param widgets    The related widgets
     * @param mapLibrary The libraries
     * @param repository The git repository
     */
    @Transactional
    public void addOrUpdateWidgets(Category category, List<Widget> widgets, Map<String, Library> mapLibrary, final Repository repository) {
        if (category == null || widgets == null) {
            return;
        }

        for (Widget widget : widgets) {
            if (widget.getLibraries() != null && mapLibrary != null) {
                widget.getLibraries().replaceAll(x -> mapLibrary.get(x.getTechnicalName()));
            }

            // Find existing widget
            Widget currentWidget = widgetRepository.findByTechnicalName(widget.getTechnicalName());
            if (currentWidget != null && !repository.equals(currentWidget.getRepository())) {
                LOGGER.info("The widget {} has been found on another repository ''{}'' and will be replace by {}", currentWidget.getTechnicalName(),
                    (currentWidget.getRepository() != null) ? currentWidget.getRepository().getName() : StringUtils.EMPTY, repository.getName());

                widget.setRepository(repository);
            }

            if (widget.getImage() != null) {
                if (currentWidget != null && currentWidget.getImage() != null) {
                    widget.getImage().setId(currentWidget.getImage().getId());
                }

                assetService.save(widget.getImage());
            }

            // Replace The existing list of params and values by the new one
            if (widget.getWidgetParams() != null && !widget.getWidgetParams().isEmpty() &&
                currentWidget != null && currentWidget.getWidgetParams() != null && !currentWidget.getWidgetParams().isEmpty()) {

                List<WidgetParam> currentWidgetParams = currentWidget.getWidgetParams();

                widget.getWidgetParams().forEach(widgetParam -> {
                    Optional<WidgetParam> widgetParamToFind = currentWidgetParams
                        .stream()
                        .filter(currentParam -> currentParam.getName().equals(widgetParam.getName()))
                        .findAny();

                    widgetParamToFind.ifPresent(currentWidgetParamFound -> {
                        // Set the ID of the new object with the current one
                        widgetParam.setId(currentWidgetParamFound.getId());

                        // Search params with the current WidgetParam in DB
                        if (widgetParam.getPossibleValuesMap() != null && !widgetParam.getPossibleValuesMap().isEmpty() &&
                            currentWidgetParamFound.getPossibleValuesMap() != null && !currentWidgetParamFound.getPossibleValuesMap().isEmpty()) {

                            widgetParam.getPossibleValuesMap().forEach(possibleValueMap -> {
                                //Search the current widget possible values in DB
                                Optional<WidgetParamValue> possibleValueMapToFind = currentWidgetParamFound.getPossibleValuesMap()
                                    .stream()
                                    .filter(currentPossibleValueMap -> currentPossibleValueMap.getJsKey().equals(possibleValueMap.getJsKey()))
                                    .findAny();
                                //Set ID of the new object with the current one in DB
                                possibleValueMapToFind.ifPresent(possibleValueMapFound -> possibleValueMap.setId(possibleValueMapFound.getId()));
                            });
                        }
                    });
                });
            }

            // Set Id
            if (currentWidget != null) {
                widget.setWidgetAvailability(currentWidget.getWidgetAvailability()); // Keep the previous widget state
                widget.setId(currentWidget.getId());
            }

            // Set activated state by default
            if (widget.getWidgetAvailability() == null) {
                widget.setWidgetAvailability(WidgetAvailabilityEnum.ACTIVATED);
            }

            // set category
            widget.setCategory(category);

            widgetRepository.save(widget);
        }
    }
}
