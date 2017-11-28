package com.eudes.semanticApi.util;

import com.eudes.semanticApi.api.Pair;
import lombok.Data;

@Data
public class Verified {

    /**
     * Type of object to verify
     */
    private Pair pair;

    /**
     * Flag to verify if the data was verified
     */
    private boolean verified = false;

    public Verified(Pair data){
        this.pair = data;
        this.verified = false;
    }

    public boolean isVerified(){
        return this.verified;
    }




}
