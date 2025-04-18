export default LoginForm;
declare class LoginForm extends CustomElement {
    initialize(): void;
    handler: () => void;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    firstUpdated(): void;
    /**
     * @param {SubmitEvent} ev
     */
    onLoginFormSubmitted(ev: SubmitEvent): Promise<void>;
    /**
     * @param {HTMLFormElement} form
     */
    discoverConnectionMethods(form: HTMLFormElement): any;
    initPopovers(): void;
    /**
     * @param {string} [jid]
     */
    connect(jid?: string): void;
}
import { CustomElement } from 'shared/components/element.js';
//# sourceMappingURL=loginform.d.ts.map