package com.eudes.semanticApi.api;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Class that hold the resource ID and the workspace name that stores the resource
 * @author Eudes Souza
 * @since 10/2017
 */
@Data
@AllArgsConstructor
public class APIResponse {

    /**
     * String the hold the name of workspace where the resource was stored
     */
    String workspace;

    /**
     * String the hold the ID of the stored resource
     */
    String resourceID;
}
