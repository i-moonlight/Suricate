package io.suricate.monitoring.model.dto.api.export;

import io.suricate.monitoring.model.dto.api.AbstractDto;
import io.suricate.monitoring.model.dto.api.project.GridPropertiesResponseDto;
import io.suricate.monitoring.model.dto.api.projectwidget.ProjectWidgetPositionResponseDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Schema(description = "Import a project")
public class ImportExportProjectDto extends AbstractDto {
    @Schema(description = "The project token", requiredMode = Schema.RequiredMode.REQUIRED)
    private String token;

    @Schema(description = "The project name", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Schema(description = "In case of rotations, should the progress bar be displayed for the project")
    private boolean displayProgressBar;

    @Schema(description = "Image of the dashboard")
    private ImportExportAssetDto image;

    @Schema(description = "The grid properties", requiredMode = Schema.RequiredMode.REQUIRED)
    private GridPropertiesResponseDto gridProperties;

    @Schema(description = "The list of grids")
    List<ImportExportProjectGridDto> grids = new ArrayList<>();

    @Data
    public static class ImportExportProjectGridDto {
        @Schema(description = "The ID", example = "1")
        private Long id;

        @Schema(description = "The time", example = "15")
        private Integer time;

        @Schema(description = "The list of grids")
        List<ImportExportProjectWidgetDto> widgets = new ArrayList<>();

        @Data
        public static class ImportExportProjectWidgetDto {
            @Schema(description = "The ID", example = "1")
            private Long id;

            @Schema(description = "The related widget technical name")
            private String widgetTechnicalName;

            @Schema(description = "The configuration of this widget")
            private String backendConfig;

            @Schema(description = "The position of the widget on the grid")
            private ProjectWidgetPositionResponseDto widgetPosition;
        }
    }
}
