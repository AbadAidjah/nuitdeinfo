package com.note.demo.controller;

// package controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.security.oauth2.jwt.Jwt;

@RestController
public class TestController {

    @GetMapping("/public/hello")
    public String publicEndpoint() {
        return "This is a public endpoint - no authentication required";
    }

    // @GetMapping("/private/hello")
    // public String privateEndpoint(@AuthenticationPrincipal Jwt jwt) {
    //     return "Hello " + jwt.getClaimAsString("preferred_username") + "This is a protected endpont";
    // }
}
