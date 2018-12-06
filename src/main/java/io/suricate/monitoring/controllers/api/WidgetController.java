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

package io.suricate.monitoring.controllers.api;

import io.suricate.monitoring.model.dto.api.error.ApiErrorDto;
import io.suricate.monitoring.model.dto.api.widget.WidgetDto;
import io.suricate.monitoring.model.entity.widget.Widget;
import io.suricate.monitoring.model.enums.ApiActionEnum;
import io.suricate.monitoring.model.enums.ApiErrorEnum;
import io.suricate.monitoring.model.mapper.widget.WidgetMapper;
import io.suricate.monitoring.service.GitService;
import io.suricate.monitoring.service.api.WidgetService;
import io.suricate.monitoring.utils.exception.ApiException;
import io.suricate.monitoring.utils.exception.NoContentException;
import io.suricate.monitoring.utils.exception.ObjectNotFoundException;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * The widget controller
 */
@RestController
@RequestMapping("/api")
@Api(value = "Widget Controller", tags = {"Widget"})
public class WidgetController {

    /**
     * Widget service
     */
    private final WidgetService widgetService;

    /**
     * The GIT service
     */
    private final GitService gitService;

    /**
     * The widget mapper
     */
    private final WidgetMapper widgetMapper;

    /**
     * Constructor
     *
     * @param widgetService Widget service to inject
     * @param gitService    The git service
     * @param widgetMapper  The widget mapper
     */
    @Autowired
    public WidgetController(final WidgetService widgetService,
                            final GitService gitService,
                            final WidgetMapper widgetMapper) {
        this.widgetService = widgetService;
        this.gitService = gitService;
        this.widgetMapper = widgetMapper;
    }

    /**
     * Get the list of widgets
     *
     * @return The list of widgets
     */
    @ApiOperation(value = "Get the full list of widgets", response = WidgetDto.class)
    @ApiResponses(value = {
        @ApiResponse(code = 200, message = "Ok", response = WidgetDto.class, responseContainer = "List"),
        @ApiResponse(code = 204, message = "No Content"),
        @ApiResponse(code = 401, message = "Authentication error, token expired or invalid", response = ApiErrorDto.class),
        @ApiResponse(code = 403, message = "You don't have permission to access to this resource", response = ApiErrorDto.class)
    })
    @GetMapping(value = "/v1/widgets")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<List<WidgetDto>> getWidgets(@ApiParam(name = "action", value = "REFRESH if we have to refresh widgets from GIT Repository", allowableValues = "refresh")
                                                      @RequestParam(value = "action", required = false) String action) {
        if (ApiActionEnum.REFRESH.name().equalsIgnoreCase(action)) {
            Future<Boolean> isDone = this.gitService.updateWidgetFromEnabledGitRepositories();

            try {
                if (!isDone.get()) {
                    throw new ApiException("Error while retrieving widgets from repository", ApiErrorEnum.INTERNAL_SERVER_ERROR);
                }
            } catch (InterruptedException e) {
                throw new ApiException("Execution interrupted while retrieving widgets from repository", ApiErrorEnum.INTERNAL_SERVER_ERROR);
            } catch (ExecutionException e) {
                throw new ApiException("Unknown execution error while retrieving widgets from repository", ApiErrorEnum.INTERNAL_SERVER_ERROR);
            }
        }

        Optional<List<Widget>> widgets = widgetService.getAll();
        if (!widgets.isPresent()) {
            throw new NoContentException(Widget.class);
        }

        return ResponseEntity
            .ok()
            .contentType(MediaType.APPLICATION_JSON)
            .cacheControl(CacheControl.noCache())
            .body(widgetMapper.toWidgetDtosDefault(widgets.get()));
    }

    /**
     * Update a widget
     *
     * @param widgetId  The widget id to update
     * @param widgetDto The object holding changes
     * @return The widget dto changed
     */
    @ApiOperation(value = "Update a widget by id", response = WidgetDto.class)
    @ApiResponses(value = {
        @ApiResponse(code = 200, message = "Ok", response = WidgetDto.class),
        @ApiResponse(code = 401, message = "Authentication error, token expired or invalid", response = ApiErrorDto.class),
        @ApiResponse(code = 403, message = "You don't have permission to access to this resource", response = ApiErrorDto.class),
        @ApiResponse(code = 404, message = "Widget not found", response = ApiErrorDto.class)
    })
    @PutMapping(value = "/v1/widgets/{widgetId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<WidgetDto> updateWidget(@ApiParam(name = "widgetId", value = "The widget id", required = true)
                                                  @PathVariable("widgetId") Long widgetId,
                                                  @ApiParam(name = "widgetDto", value = "The widget with modifications", required = true)
                                                  @RequestBody WidgetDto widgetDto) {
        Optional<Widget> widgetOpt = widgetService.updateWidget(widgetId, widgetDto);

        if (!widgetOpt.isPresent()) {
            throw new ObjectNotFoundException(Widget.class, widgetId);
        }

        return ResponseEntity
            .ok()
            .contentType(MediaType.APPLICATION_JSON)
            .cacheControl(CacheControl.noCache())
            .body(widgetMapper.toWidgetDtoDefault(widgetOpt.get()));
    }
}
