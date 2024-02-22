import 'shared/autocomplete/index.js';
import tplMUCSidebar from "./templates/muc-sidebar.js";
import { CustomElement } from 'shared/components/element.js';
import { _converse, api, converse } from "@converse/headless";
import { RosterFilter } from '@converse/headless/plugins/roster/filter.js';
import { initStorage } from "@converse/headless/utils/storage";
import debounce from 'lodash-es/debounce.js';

import 'shared/styles/status.scss';
import './styles/muc-occupants.scss';

const { u } = converse.env;

export default class MUCSidebar extends CustomElement {

    constructor () {
        super();
        this.jid = null;
    }

    static get properties () {
        return {
            jid: { type: String }
        }
    }

    initialize() {
        const filter_id = `_converse.occupants-filter-${this.jid}`;
        this.filter = new RosterFilter();
        this.filter.id = filter_id;
        initStorage(this.filter, filter_id);
        this.filter.fetch();

        const { chatboxes } = _converse.state;
        this.model = chatboxes.get(this.jid);

        // To avoid rendering continuously the participant list in case of massive joins/leaves:
        const debouncedRequestUpdate = debounce(() => this.requestUpdate(), 200, {
            maxWait: 1000
        });

        this.listenTo(this.model, 'change', () => this.requestUpdate());
        this.listenTo(this.model.occupants, 'add', debouncedRequestUpdate);
        this.listenTo(this.model.occupants, 'remove', debouncedRequestUpdate);
        this.listenTo(this.model.occupants, 'change', debouncedRequestUpdate);
        this.listenTo(this.model.occupants, 'sort', debouncedRequestUpdate);
        this.listenTo(this.model.occupants, 'vcard:change', debouncedRequestUpdate);
        this.listenTo(this.model.occupants, 'vcard:add', debouncedRequestUpdate);

        this.model.initialized.then(() => this.requestUpdate());
    }

    render () {
        const tpl = tplMUCSidebar(this, Object.assign(
            this.model.toJSON(), {
                'occupants': [...this.model.occupants.models],
                'onOccupantClicked': ev => this.onOccupantClicked(ev),
            }
        ));
        return tpl;
    }

    /** @param {MouseEvent} ev */
    toggleFilter (ev) {
        ev?.preventDefault?.();
        u.safeSave(this.model, { 'filter_visible': !this.model.get('filter_visible') });
    }

    /** @param {MouseEvent} ev */
    closeSidebar (ev) {
        ev?.preventDefault?.();
        u.safeSave(this.model, { 'hidden_occupants': true });
    }

    /** @param {MouseEvent} ev */
    onOccupantClicked (ev) {
        ev?.preventDefault?.();
        const { chatboxviews } = _converse.state;
        const view = chatboxviews.get(this.getAttribute('jid'));
        const occ_el = /** @type {HTMLElement} */(ev.target);
        view?.getMessageForm().insertIntoTextArea(`@${occ_el.textContent}`);
    }
}

api.elements.define('converse-muc-sidebar', MUCSidebar);
