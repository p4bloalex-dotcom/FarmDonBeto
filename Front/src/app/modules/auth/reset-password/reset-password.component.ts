import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    AbstractControl,
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { HotToastService } from '@fuse/components/hot-toast';
import { ApiResponse } from '@fuse/services/config/config.ApiResponse';
import { FuseValidators } from '@fuse/validators';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'auth-reset-password',
    templateUrl: './reset-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterLink,
    ]
})
export class AuthResetPasswordComponent implements OnInit {
    @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;
    resetPasswordForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _toast: HotToastService,
        private _activatedRoute: ActivatedRoute,
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
ngOnInit(): void {
  this.resetPasswordForm = this._formBuilder.group(
    {
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          this.passwordStrengthValidator(),
        ],
      ],
      passwordConfirm: ['', Validators.required],
    },
    {
      validators: FuseValidators.mustMatch('password', 'passwordConfirm'),
    }
  );
}



    private passwordStrengthValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            if (!value) return null;

            const hasUpperCase = /[A-Z]/.test(value);
            const hasLowerCase = /[a-z]/.test(value);
            const hasNumber = /\d/.test(value);

            const isValid = hasUpperCase && hasLowerCase && hasNumber;

            return !isValid ? { passwordStrength: true } : null;
        };
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Reset password
     */
    resetPassword(): void {
        // Return if the form is invalid


        if (this.resetPasswordForm.invalid) {
            this.resetPasswordForm.markAllAsTouched();
            return;
        }

        // Disable the form
        this.resetPasswordForm.disable();

        this._authService
            .changePassword(this.resetPasswordForm.get('password').value, this.resetPasswordForm.get('passwordConfirm').value)
            .subscribe({
                next: (response: ApiResponse<any>) => {
                    if (response.success) {
                        const redirectURL =
                            this._activatedRoute.snapshot.queryParamMap.get('redirectURL') ||
                            '/signed-in-redirect';
                        this._router.navigateByUrl(redirectURL)
                    }
                    else {
                        this._toast.error(response.message ?? 'No se pudo actualizar la contrasena.');
                        this.resetPasswordForm.enable();
                        this.resetPasswordNgForm.resetForm();
                        this.showAlert = true;
                    }
                },
                error: (error) => {
                    this._toast.error(error?.error?.message ?? 'Error inesperado. Intenta mas tarde.');
                    this.resetPasswordForm.enable();
                    this.resetPasswordNgForm.resetForm();
                }
            })
    }


    get f() {
        return this.resetPasswordForm.controls;
    }


}
