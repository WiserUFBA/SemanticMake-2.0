package com.semanticMake.framework;

import java.util.ArrayList;
import java.util.List;

/**
 * Class that is used to define the structure of the client-defined resource in JSON format
 * @author Eudes Souza
 * @since 10/2017
 */
public class SMResource {

    /**
     * Prefixo do recurso criado
     */
    private String prefix;

    /**
     * Created resource type
     */
    private String name;

    /**
     * List of vocabularies used in the created resource
     */
    List<SMVocabulary> vocabularies = new ArrayList<>();

    /**
     * URI of the created resource
     */
    private String about;

    /**
     * The constructor of the object without params
     */
    public SMResource() {
        this.about          = null;
        this.name           = null;
        this.prefix         = null;
        this.vocabularies   = null;
    }

    /**
     * The constructor of the object with all params
     * @param about The resource URI
     * @param prefix The resource prefix
     * @param name The resource name
     * @param vocabularies The resource vocabularies
     */
    public SMResource(String about, String prefix, String name, List<SMVocabulary> vocabularies) {
        this.about          = about;
        this.prefix         = prefix;
        this.name           = name;
        this.vocabularies   = vocabularies;
    }

    /**
     * Get method to the resource URI
     * @return A string with the resource URI
     */
    public String getAbout() {
        return this.about;
    }

    /**
     * Get method to the resource prefix
     * @return A string with the resource prefix
     */
    public String getPrefix() {
        return this.prefix;
    }

    /**
     * Get method to the resource name
     * @return A string with the resource name
     */
    public String getName() {
        return this.name;
    }

    /**
     * Get method to the resource vocabularies
     * @return A list with the resource vocabularies
     */
    public List<SMVocabulary> getVocabularies() {
        return this.vocabularies;
    }

    /**
     * Set method to the resource URI
     * @param about A string containing the resource URI value
     */
    public void setAbout(String about) {
        this.about = about;
    }

    /**
     * Set method to the resource prefix
     * @param prefix A string containing the resource prefix value
     */
    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    /**
     * Set method to the resource URI
     * @param name A string containing the resource URI value
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Set method to the resource vocabularies
     * @param vocabularies A list of vocabularies containing the resource vocabularies
     */
    public void setVocabularies(List<SMVocabulary> vocabularies) {
        this.vocabularies = vocabularies;
    }

    public boolean equals(Object o) {
        if(o == this) {
            return true;
        } else if(!(o instanceof SMResource)) {
            return false;
        } else {
            SMResource other = (SMResource)o;
            if(!other.canEqual(this)) {
                return false;
            } else {
                label59: {
                    String this$about = this.getAbout();
                    String other$about = other.getAbout();
                    if(this$about == null) {
                        if(other$about == null) {
                            break label59;
                        }
                    } else if(this$about.equals(other$about)) {
                        break label59;
                    }

                    return false;
                }

                String this$prefix = this.getPrefix();
                String other$prefix = other.getPrefix();
                if(this$prefix == null) {
                    if(other$prefix != null) {
                        return false;
                    }
                } else if(!this$prefix.equals(other$prefix)) {
                    return false;
                }

                String this$name = this.getName();
                String other$name = other.getName();
                if(this$name == null) {
                    if(other$name != null) {
                        return false;
                    }
                } else if(!this$name.equals(other$name)) {
                    return false;
                }

                List this$vocabularies = this.getVocabularies();
                List other$vocabularies = other.getVocabularies();
                if(this$vocabularies == null) {
                    if(other$vocabularies != null) {
                        return false;
                    }
                } else if(!this$vocabularies.equals(other$vocabularies)) {
                    return false;
                }

                return true;
            }
        }
    }

    protected boolean canEqual(Object other) {
        return other instanceof SMResource;
    }

    public int hashCode() {
        boolean PRIME = true;
        byte result = 1;
        String $about = this.getAbout();
        int result1 = result * 59 + ($about == null?43:$about.hashCode());
        String $prefix = this.getPrefix();
        result1 = result1 * 59 + ($prefix == null?43:$prefix.hashCode());
        String $name = this.getName();
        result1 = result1 * 59 + ($name == null?43:$name.hashCode());
        List $vocabularies = this.getVocabularies();
        result1 = result1 * 59 + ($vocabularies == null?43:$vocabularies.hashCode());
        return result1;
    }

    /**
     * A method to print the object like string
     * @return A string that represents the resource
     */
    public String toString() {
        return "SMResource(about=" + this.getAbout() + ", prefix=" + this.getPrefix() + ", name=" + this.getName() + ", vocabularies=" + this.getVocabularies() + ")";
    }

}
