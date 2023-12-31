package com.michelin.suricate.model.dto.api.export;

import com.michelin.suricate.model.dto.api.AbstractDto;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Import export asset DTO.
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Schema(description = "Export asset data")
public class ImportExportAssetDto extends AbstractDto {
    @Schema(description = "The blob content")
    private byte[] content;

    @Schema(description = "The content type")
    private String contentType;

    @Schema(description = "The size of the asset", example = "1")
    private long size;
}
