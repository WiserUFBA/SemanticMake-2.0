package com.eudes.semanticApi.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/createAndSave")
    public String createSave() {
        return "createAndSave";
    }

    @GetMapping ("/more")
        public String more (){
        return "more";
        }


    @GetMapping("/semanticApiInterface")
    public String saveFromRDFModel2() {
        return "semanticApiInterface";
    }

}
