package cz.inqool.nkp.api.security;

import java.util.Collection;
import java.util.Collections;

import cz.inqool.nkp.api.controller.HBaseController;
import cz.inqool.nkp.api.model.AppUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class AppUserPrincipal implements UserDetails {
    private static final Logger log = LoggerFactory.getLogger(AppUserPrincipal.class);

    private final AppUser user;

    public AppUserPrincipal(AppUser user) {
        this.user = user;
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        log.info(user.getRole().name());
        return Collections.<GrantedAuthority>singletonList(new SimpleGrantedAuthority(user.getRole().name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public AppUser getAppUser() {
        return user;
    }
}