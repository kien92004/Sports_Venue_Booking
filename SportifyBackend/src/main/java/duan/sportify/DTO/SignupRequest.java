package duan.sportify.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest  {
     private String firstnameSignUp;
    private String lastnameSignUp;
    private String usernameSignUp;
    private String passwordSignUp;
    private String phoneSignUp;
    private String genderSignUp;
    private String addressSignUp;
    private String emailSignUp;
}
