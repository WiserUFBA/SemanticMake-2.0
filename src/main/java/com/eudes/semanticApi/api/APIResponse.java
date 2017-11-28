package com.eudes.semanticApi.api;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Class that hold the resource ID and the workspace name that stores the resource
 */
@Data
@AllArgsConstructor
public class APIResponse {
    String workspace;
    String resourceID;
}
