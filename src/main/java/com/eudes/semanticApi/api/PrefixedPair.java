package com.eudes.semanticApi.api;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PrefixedPair {

    private String prefix;

    private String uri;

    Pair pair;
}
