package com.semanticMake.semanticApi.api;

import com.semanticMake.framework.VProperty;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PrefixedPair {

    /**
     * String to hold the PrefixedPair prefix
     */
    private String prefix;

    /**
     * String to hold the PreixedPair uri
     */
    private String uri;

    /**
     * Pair to hold the PreixedPair pair
     */
    VProperty vProperty;
}
