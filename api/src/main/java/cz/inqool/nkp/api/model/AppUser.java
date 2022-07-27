package cz.inqool.nkp.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

import javax.persistence.*;

@Entity
@Table(name = "users")
@Setter
@Getter
@NoArgsConstructor
public class AppUser {

    public enum Role {
        USER,
        ADMIN
    }

    @Id
    @GeneratedValue(generator = "user_generator")
    @SequenceGenerator(
            name = "user_generator",
            sequenceName = "user_sequence"
    )
    private long id;

    private String name;

    @Column(unique = true)
    private String username;

    @JsonIgnore
    private String accessToken;

    @JsonIgnore
    private String password;

    private Date lastLogin;

    @JsonIgnore
    private boolean enabled = true;

    private Role role = Role.USER;

    public AppUser(String name, String username, String password) {
        this.username = username;
        this.name = name;
        this.password = password;
    }
}
