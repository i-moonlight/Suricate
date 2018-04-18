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

import io.suricate.monitoring.model.dto.project.ProjectDto;
import io.suricate.monitoring.model.entity.project.Project;
import io.suricate.monitoring.model.entity.project.ProjectWidget;
import io.suricate.monitoring.model.enums.WidgetAvailabilityEnum;
import io.suricate.monitoring.model.dto.websocket.UpdateEvent;
import io.suricate.monitoring.model.dto.project.ProjectWidgetDto;
import io.suricate.monitoring.model.enums.UpdateType;
import io.suricate.monitoring.model.entity.user.User;
import io.suricate.monitoring.repository.ProjectRepository;
import io.suricate.monitoring.service.scheduler.DashboardScheduleService;
import io.suricate.monitoring.service.webSocket.DashboardWebSocketService;
import io.suricate.monitoring.utils.logging.LogExecutionTime;
import org.apache.commons.lang3.StringUtils;
import org.jasypt.encryption.StringEncryptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service used to manage projects
 */
@Service
public class ProjectService {

    /**
     * Class logger
     */
    private final static Logger LOGGER = LoggerFactory.getLogger(ProjectService.class);

    /**
     * String encryptor (mainly used for SECRET widget params)
     */
    private final StringEncryptor stringEncryptor;

    /**
     * Project repository
     */
    private final ProjectRepository projectRepository;

    /**
     * User service
     */
    private final UserService userService;

    /**
     * dashboard Socket service
     */
    private final DashboardWebSocketService dashboardWebsocketService;

    /**
     * The dashboard schedule service
     */
    private final DashboardScheduleService dashboardScheduleService;

    /**
     * Widget service
     */
    private final WidgetService widgetService;

    /**
     * The project widget service
     */
    private final ProjectWidgetService projectWidgetService;

    /**
     * Library service
     */
    private final transient LibraryService libraryService;

    /**
     * Constructor
     *
     * @param stringEncryptor The string encryptor to inject
     * @param projectRepository The project repository to inject
     * @param userService The user service to inject
     * @param dashboardWebSocketService The dashboard web socket service to inject
     * @param dashboardScheduleService The dashboard schedule service to inject
     * @param widgetService The widget service to inject
     * @param projectWidgetService The project widget service to inject
     * @param libraryService The library service to inject
     */
    @Autowired
    public ProjectService(@Qualifier("jasyptStringEncryptor") final StringEncryptor stringEncryptor,
                          final ProjectRepository projectRepository,
                          final UserService userService,
                          final DashboardWebSocketService dashboardWebSocketService,
                          @Lazy final DashboardScheduleService dashboardScheduleService,
                          final WidgetService widgetService,
                          @Lazy final ProjectWidgetService projectWidgetService,
                          final LibraryService libraryService) {

        this.stringEncryptor = stringEncryptor;
        this.projectRepository = projectRepository;
        this.userService = userService;
        this.dashboardWebsocketService = dashboardWebSocketService;
        this.dashboardScheduleService = dashboardScheduleService;
        this.widgetService = widgetService;
        this.projectWidgetService = projectWidgetService;
        this.libraryService = libraryService;
    }

    /**
     * Transforme a model object into a DTO object
     *
     * @param project The project model object
     * @param withRelatedWidgets True if we want to attach the related widgets false otherwise
     * @return The associated DTO object
     */
    public ProjectDto toDTO(Project project, boolean withRelatedWidgets) {
        ProjectDto projectDto = new ProjectDto();

        projectDto.setId(project.getId());
        projectDto.setName(project.getName());
        projectDto.setToken(project.getToken());
        projectDto.setWidgetHeight(project.getWidgetHeight());
        projectDto.setMaxColumn(project.getMaxColumn());
        projectDto.setCssStyle(project.getCssStyle());

        if(withRelatedWidgets) {
            List<ProjectWidget> projectWidgets = projectWidgetService.getAllByProjectIdAndWidgetAvailability(project.getId(), WidgetAvailabilityEnum.ACTIVATED);
            for (ProjectWidget projectWidget : projectWidgets) {
                projectDto.getProjectWidgets().add(projectWidgetService.instantiateProjectWidget(projectWidget));
            }
        }

        List<String> librairies = libraryService.getLibraries(project.getWidgets());
        if(librairies != null && !librairies.isEmpty()) {
            projectDto.getLibrariesToken().addAll(librairies);
        }

        Optional<List<User>> users = userService.getAllByProject(project);
        users.ifPresent(
            currentUserList -> projectDto.getUsers().addAll(
                currentUserList.stream().map(userService::toDto).collect(Collectors.toList())
            )
        );
        return projectDto;
    }

    /**
     * Tranforme a model object into a DTO object
     *
     * @param projectDto The DTO project object
     * @return The associated model object
     */
    public Project toModel(ProjectDto projectDto) {
        Project project = new Project();

        project.setId(projectDto.getId());
        project.setName(projectDto.getName());
        project.setMaxColumn(projectDto.getMaxColumn());
        project.setWidgetHeight(projectDto.getWidgetHeight());
        project.setCssStyle(projectDto.getCssStyle());
        project.setToken("");

        return project;
    }

    public List<Project> getAll() {
        return projectRepository.findAll();
    }

    /**
     * Retrieve all the project for a user
     *
     * @param user The user
     * @return The project list associated to the user
     */
    public List<Project> getAllByUser(User user) {
        return projectRepository.findByUsers_IdOrderByName(user.getId());
    }

    /**
     * Get a project by the project id
     *
     * @param id The id of the project
     * @return The project associated
     */
    @LogExecutionTime
    public Optional<Project> getOneById(Long id){
        Project project = projectRepository.findOne(id);

        if(project == null) {
            return Optional.empty();
        }
        return Optional.of(project);
    }

    /**
     * Create a new project for a user
     *
     * @param user The user how create the project
     * @param project The project to instantiate
     * @return The project instantiate
     */
    @Transactional
    public Project saveProject(User user, Project project) {
        project.getUsers().add(user);

        if(StringUtils.isBlank(project.getToken())) {
            project.setToken(stringEncryptor.encrypt(UUID.randomUUID().toString()));
        }

        return projectRepository.save(project);
    }

    /**
     * Delete a user from a project
     *
     * @param user The user to delete
     * @param project The project related
     * @return The project with user deleted
     */
    public Project deleteUserFromProject(User user, Project project) {
        project.getUsers().remove(user);
        return projectRepository.save(project);
    }

    /**
     * Add a new widget into the project
     *
     * @param projectWidgetDto The project widget to add
     * @return The projectWidget instantiate
     */
    @Transactional
    public ProjectWidget addWidgetToProject(ProjectWidgetDto projectWidgetDto) {
        ProjectWidget projectWidget = new ProjectWidget();
        projectWidget.setCol(0);
        projectWidget.setRow(0);
        projectWidget.setWidth(1);
        projectWidget.setHeight(1);
        projectWidget.setData("{}");
        projectWidget.setBackendConfig(projectWidgetDto.getBackendConfig());
        projectWidget.setWidget(widgetService.findOne(projectWidgetDto.getWidget().getId()));
        projectWidget.setProject(projectRepository.findOne(projectWidgetDto.getProject().getId()));

        // Add project widget
        projectWidget = projectWidgetService.saveAndFlush(projectWidget);
        dashboardScheduleService.scheduleWidget(projectWidget.getId());

        // Update grid
        dashboardWebsocketService.updateGlobalScreensByProjectToken(projectWidget.getProject().getToken(),  new UpdateEvent(UpdateType.GRID));

        return projectWidget;
    }

    /**
     * Method used for retrieve a project token from a project id
     *
     * @param projectId The project id
     * @return The related token
     */
    public String getTokenByProjectId(final Long projectId) {
        return projectRepository.getToken(projectId);
    }

    /**
     * Method used to update a project
     * @param project the project to update
     * @param newName the new name
     */
    @Transactional
    public void updateProject(Project project, String newName) {
        project.setName(newName);
        projectRepository.save(project);
        // Update grid
        dashboardWebsocketService.updateGlobalScreensByProjectToken(project.getToken(), new UpdateEvent(UpdateType.GRID));
    }

    /**
     * Method used to delete a project with his ID
     * @param id the project ID
     */
    public void deleteProject(Long id){
        // notify clients
        dashboardWebsocketService.updateGlobalScreensByProjectId(id, new UpdateEvent(UpdateType.DISCONNECT));
        // delete project
        projectRepository.delete(id);
    }
}
