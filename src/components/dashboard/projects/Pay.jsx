import PropTypes from 'prop-types';
import React from 'react';
import {Table} from 'react-bootstrap';
import moment from 'moment';

import Button from "../../core/Button";
import Icon from "../../core/Icon";
import InvoiceForm from "./modals/InvoiceForm";
import IconButton from "../../core/IconButton";
import StripeButton from "../../core/StripeButton";
import Progress from "../../core/Progress";
import PaymentOptions from "../../dashboard/payments/PaymentOptions";
import InvoiceDetails from "../../dashboard/payments/InvoiceDetails";

import {
    getUser,
    isAdmin,
    isClient,
    isDev,
    isDevOrClient,
    isPayAdmin,
    isPayAdminOrPM,
    isProjectClient
} from "../../utils/auth";
import {openConfirm, openModal} from "../../core/utils/modals";
import {
    ENDPOINT_INVOICES,
    INVOICE_TYPE_CREDIT_NOTA,
    INVOICE_TYPE_PURCHASE,
    INVOICE_TYPE_SALE,
    INVOICE_TYPES
} from "../../../actions/utils/api";
import {
    batchInvoices,
    filterInvoices,
    filterInvoicesAndCreditNota,
    filterMultiInvoicesTypes,
    sumInvoices
} from "../../utils/payments";
import {parsePaymentObject} from "../../utils/stripe";


export default class Pay extends React.Component {
    static propTypes = {
        project: PropTypes.object,
        invoices: PropTypes.array,
        InvoiceActions: PropTypes.object,
        selectionKey: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {open: null};
    }

    onCreateInvoice(type) {
        const {project, InvoiceActions} = this.props;
        openModal(<InvoiceForm invoice={{type}}
                               project={project}/>, `Add ${INVOICE_TYPES[type]}`).then(data => {
            if (data.type === INVOICE_TYPE_SALE) {
                InvoiceActions.createInvoice(
                    {
                        ...data,
                        milestone: data.milestone ? {id: data.milestone.id} : null,
                        user: {id: project.owner ? project.owner.id : project.user.id},
                        project: {id: project.id}
                    },
                    this.props.selectionKey
                );
            } else if (data.type === INVOICE_TYPE_CREDIT_NOTA) {
                InvoiceActions.createInvoice(
                    {
                        ...data,
                        milestone: data.milestone ? {id: data.milestone.id} : null,
                        user: {id: project.owner ? project.owner.id : project.user.id},
                        project: {id: project.id},
                    },
                    this.props.selectionKey
                );
            } else if (data.invoice.type === INVOICE_TYPE_PURCHASE) {
                let cleanData = [], invoice = data.invoice, payouts = data.payouts;
                if (payouts && invoice) {
                    Object.keys(payouts).forEach(idx => {
                        let payout = payouts[idx];
                        if (payout.user && payout.amount) {
                            cleanData.push({
                                ...invoice,
                                milestone: invoice.milestone ? {id: invoice.milestone.id} : null,
                                amount: payout.amount,
                                user: {id: payout.user.id},
                                project: {id: project.id}
                            });
                        }
                    });
                }
                if (cleanData.length) {
                    InvoiceActions.createInvoiceBatch(
                        cleanData,
                        this.props.selectionKey
                    );
                }
            }
        }, error => {

        });
    }


    onUpdateInvoice(invoice) {
        this.onToggleActions(invoice.id);
        let cleanInvoice = {};
        ['id', 'type', 'title', 'issued_at', 'amount', 'milestone'].forEach(key => {
            cleanInvoice[key] = invoice[key];
        });
        const {project, InvoiceActions} = this.props;
        openModal(<InvoiceForm invoice={cleanInvoice}
                               project={project}/>, `Edit ${INVOICE_TYPES[invoice.type]}`).then(data => {
            if (invoice.type === INVOICE_TYPE_SALE || invoice.type === INVOICE_TYPE_CREDIT_NOTA) {
                InvoiceActions.updateInvoice(
                    invoice.id,
                    {...data, milestone: data.milestone ? {id: data.milestone.id} : null},
                    this.props.selectionKey
                );
            }
        }, error => {

        });
    }

    onDeleteInvoice(invoiceId) {
        this.onToggleActions(invoiceId);
        const {InvoiceActions} = this.props;
        openConfirm(
            'Are you sure you want to delete this invoice?', '',
            true, {ok: 'Yes'}
        ).then(response => {
            InvoiceActions.deleteInvoice(invoiceId, this.props.selectionKey);
        }, error => {
            // Nothing
        });
    }

    onMarkPaid(invoiceId) {
        this.onToggleActions(invoiceId);
        const {InvoiceActions} = this.props;
        openConfirm(
            <div className="font-weight-bold">Are you sure you want to mark this invoice as paid?</div>, '',
            true, {ok: 'Yes'}
        ).then(response => {
            InvoiceActions.updateInvoice(invoiceId, {paid: true}, this.props.selectionKey);
        }, error => {
            // Nothing
        });
    }

    onMarkArchived(invoiceId) {
        this.onToggleActions(invoiceId);
        const {InvoiceActions} = this.props;
        openConfirm(
            <div className="font-weight-bold">Are you sure you want to archive this invoice?</div>, '',
            true, {ok: 'Yes'}
        ).then(response => {
            InvoiceActions.archiveInvoice(invoiceId, this.props.selectionKey);
        }, error => {
            // Nothing
        });
    }

    onGenerateInvoice(invoiceId) {
        this.onToggleActions(invoiceId);
        const {InvoiceActions} = this.props;
        openConfirm(
            <div className="font-weight-bold">Are you sure you want to generate an invoice for this payment?</div>, '',
            true, {ok: 'Yes'}
        ).then(response => {
            InvoiceActions.generateInvoice(invoiceId, this.props.selectionKey);
        }, error => {
            // Nothing
        });
    }

    onUpdateInvoiceBatch(ref, invoices) {
        this.onToggleActions(ref);
        let invoice = invoices[0];
        let cleanInvoice = {};
        ['type', 'title', 'issued_at', 'milestone'].forEach(key => {
            cleanInvoice[key] = invoice[key];
        });

        let payouts = {};
        invoices.forEach((item, idx) => {
            payouts[idx] = {id: item.id, user: item.user, amount: item.amount};
        });
        const {project, InvoiceActions} = this.props;
        openModal(<InvoiceForm invoice={cleanInvoice}
                               payouts={payouts}
                               project={project}/>,
            `Edit ${invoice.type === INVOICE_TYPE_SALE ? 'Payment' : 'Payout'}`
        ).then(data => {
            if (invoice.type === INVOICE_TYPE_PURCHASE) {
                let cleanData = [],
                    invoice = data.invoice,
                    payouts = data.payouts;

                if (payouts && invoice) {
                    Object.keys(payouts).forEach(idx => {
                        let payout = payouts[idx];
                        if (payout.user && payout.amount) {
                            let payObj = {
                                ...invoice,
                                milestone: invoice.milestone ? {id: invoice.milestone.id} : null,
                                amount: payout.amount,
                                user: {id: payout.user.id},
                                project: {id: project.id}
                            };
                            if (payout.id) {
                                payObj.id = payout.id;
                            }
                            payObj.batch_ref = ref;
                            cleanData.push(payObj);
                        }
                    });
                }

                let retainedIds = [];
                if (cleanData.length) {
                    cleanData.forEach(item => {
                        if (item.id) {
                            retainedIds.push(item.id);
                            InvoiceActions.updateInvoice(
                                item.id,
                                item,
                                this.props.selectionKey
                            );
                        } else {
                            InvoiceActions.createInvoice(
                                item,
                                this.props.selectionKey
                            );
                        }
                    });
                }

                invoices.forEach(item => {
                    if (!retainedIds.includes(item.id)) {
                        InvoiceActions.deleteInvoice(item.id, this.props.selectionKey);
                    }
                });
            }
        }, error => {

        });
    }

    onDeleteInvoiceBatch(ref, invoices) {
        this.onToggleActions(ref);
        const {InvoiceActions} = this.props;
        openConfirm(
            'Are you sure you want to delete this payout?', '',
            true, {ok: 'Yes'}
        ).then(response => {
            invoices.forEach(invoice => {
                InvoiceActions.deleteInvoice(invoice.id, this.props.selectionKey);
            });
        }, error => {
            // Nothing
        });
    }

    onApprovePayout(ref, invoices) {
        this.onToggleActions(ref);
        const {InvoiceActions} = this.props;
        openConfirm(
            <div className="font-weight-bold">Are you sure you want to approve this payout?</div>, '',
            true, {ok: 'Yes'}
        ).then(response => {
            invoices.forEach(invoice => {
                InvoiceActions.updateInvoice(invoice.id, {status: 'approved'}, this.props.selectionKey);
            });
        }, error => {
            // Nothing
        });
    }

    onToggleActions(invoiceId) {
        this.setState({open: this.state.open === invoiceId ? null : invoiceId});
    }

    openPay(invoice) {
        openModal(<PaymentOptions/>, 'Payment options', true, {className: 'modal-pay'}).then(type => {
            if (type === 'card') {
                $(`.pay_stripe_${invoice.id}`).click();
            } else {
                openModal(
                    <InvoiceDetails invoice={invoice}/>,
                    'Download Invoice', true, {className: 'modal-pay'}
                );
            }
        }).catch(error => {

        });
    }

    onPay(invoice, token) {
        const {InvoiceActions} = this.props;
        InvoiceActions.payInvoice(invoice.id, parsePaymentObject(invoice, token), this.props.selectionKey);
    }

    render() {
        const {project, invoices, isSaving} = this.props,
            payments = filterMultiInvoicesTypes(invoices, INVOICE_TYPE_SALE, INVOICE_TYPE_CREDIT_NOTA),
            credi_nota = filterInvoices(invoices, INVOICE_TYPE_CREDIT_NOTA),
            payouts = filterInvoices(invoices, INVOICE_TYPE_PURCHASE);

        let batchPayouts = batchInvoices(payouts);

        return (
            <div className="project-payments">
                {invoices.length === 0 && isDevOrClient() && !isAdmin() ? (
                    <div className="font-weight-normal">No payment planning yet.</div>
                ) : (
                    <div>
                        {isDev() ? null : (
                            <div className="section">
                                <div className="section-title">Payments</div>

                                <div className="section-action">
                                    {isPayAdminOrPM() && !project.archived ? (
                                        <Button size="sm"
                                                onClick={this.onCreateInvoice.bind(this, INVOICE_TYPE_SALE)}>
                                            <Icon name="add"/> Add payment
                                        </Button>
                                    ) : null}
                                    <span> </span>

                                    {isPayAdmin() && !project.archived ? (
                                        <Button size="sm"
                                                onClick={this.onCreateInvoice.bind(this, INVOICE_TYPE_CREDIT_NOTA)}>
                                            <Icon name="add"/> Add credit nota
                                        </Button>

                                    ) : null}
                                </div>
                                {payments.length ? (
                                    <div className="payment-list table-responsive">
                                        <Table striped>
                                            <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Date</th>
                                                <th>Invoice</th>
                                                <th>Amount</th>
                                                <th/>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {payments.map(invoice => {
                                                return (
                                                    <tr key={invoice.id}>
                                                        <td style={{width: "35%"}}>{invoice.title}</td>
                                                        <td style={{width: "20%"}}>{moment.utc(invoice.issued_at).format('DD/MMM/YYYY')}</td>
                                                        <td style={{width: "10%"}}>
                                                            {invoice.number || invoice.finalized === true ? (
                                                                <a href={`${ENDPOINT_INVOICES}${invoice.id}/download/?format=pdf`}
                                                                   target="_blank">
                                                                    {invoice.number}
                                                                </a>) : null}
                                                        </td>
                                                        <td style={{width: "20%"}}>
                                                            {invoice.total_amount === invoice.amount ? (
                                                                <div>{invoice.type === INVOICE_TYPE_CREDIT_NOTA ? (
                                                                    <span>-€{invoice.amount}</span>) : (
                                                                    <span>€{invoice.amount}</span>)}</div>
                                                            ) : (
                                                                <div>
                                                                    <div className="clearfix">
                                                                        <div className="float-left">Fee:</div>
                                                                        <div
                                                                            className="float-right">{invoice.type === INVOICE_TYPE_CREDIT_NOTA ? (
                                                                            <span>-€{invoice.amount}</span>) : (
                                                                            <span>€{invoice.amount}</span>)}</div>
                                                                    </div>
                                                                    {Math.round(invoice.processing_fee) ? (
                                                                        <div className="clearfix">
                                                                            <div className="float-left">Processing:
                                                                            </div>
                                                                            <div
                                                                                className="float-right">{invoice.type === INVOICE_TYPE_CREDIT_NOTA ? (
                                                                                <span>-€{invoice.processing_fee}</span>) : (
                                                                                <span>€{invoice.processing_fee}</span>)}</div>
                                                                        </div>
                                                                    ) : null}
                                                                    {Math.round(invoice.tax_amount) ? (
                                                                        <div className="clearfix">
                                                                            <div className="float-left">VAT:</div>
                                                                            <div
                                                                                className="float-right">{invoice.type === INVOICE_TYPE_CREDIT_NOTA ? (
                                                                                <span>-€{invoice.tax_amount}</span>) : (
                                                                                <span>€{invoice.tax_amount}</span>)}</div>
                                                                        </div>
                                                                    ) : null}
                                                                    <div className="subtotal">
                                                                        <div className="float-left">Total:</div>
                                                                        <div
                                                                            className="float-right">{invoice.type === INVOICE_TYPE_CREDIT_NOTA ? (
                                                                            <span>-€{invoice.total_amount}</span>) : (
                                                                            <span>€{invoice.total_amount}</span>)}</div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{width: "15%"}}>
                                                            {invoice.paid ? (
                                                                <div>
                                                                    <Icon name="check" className="green"/> Paid
                                                                </div>
                                                            ) : isSaving[invoice.id] ? (
                                                                <div>
                                                                    <Progress message="Processing"/>
                                                                </div>
                                                            ) : (
                                                                <div className="clearfix">
                                                                    {isProjectClient(invoice.project) && invoice.type !== INVOICE_TYPE_CREDIT_NOTA ? (
                                                                        <React.Fragment>
                                                                            <StripeButton size="sm"
                                                                                          amount={invoice.total_amount}
                                                                                          email={getUser().email}
                                                                                          description={invoice.title}
                                                                                          onPay={this.onPay.bind(this, invoice)}
                                                                                          className={`pay_stripe_${invoice.id}`}/>
                                                                            <Button size="sm"
                                                                                    onClick={this.openPay.bind(this, invoice)}><Icon
                                                                                name="cash"/> Pay</Button>
                                                                        </React.Fragment>
                                                                    ) : null}
                                                                    {isPayAdminOrPM() && !project.archived ? (
                                                                        <div className="float-right">
                                                                            <div className="actions">
                                                                                <IconButton name="colon" size={null}
                                                                                            onClick={this.onToggleActions.bind(this, invoice.id)}/>
                                                                                {this.state.open === invoice.id ? (
                                                                                    <div className="dropper">
                                                                                        {isAdmin() && !invoice.finalized && !invoice.number ? (
                                                                                            <Button size="sm"
                                                                                                    onClick={this.onGenerateInvoice.bind(this, invoice.id)}>
                                                                                                Generate Invoice
                                                                                            </Button>
                                                                                        ) : null}
                                                                                        {isAdmin() && !invoice.finalized && !invoice.number ? (
                                                                                            <Button size="sm"
                                                                                                    onClick={this.onUpdateInvoice.bind(this, invoice)}>
                                                                                                Edit payment
                                                                                            </Button>
                                                                                        ) : null}
                                                                                        <Button size="sm"
                                                                                                onClick={this.onDeleteInvoice.bind(this, invoice.id)}>
                                                                                            Delete payment
                                                                                        </Button>
                                                                                        {isPayAdmin() && invoice.number && !invoice.paid ? (
                                                                                            <Button size="sm"
                                                                                                    onClick={this.onMarkPaid.bind(this, invoice.id)}>
                                                                                                Mark as paid
                                                                                            </Button>
                                                                                        ) : null}
                                                                                        {isPayAdmin() && invoice.number && !invoice.paid ? (
                                                                                            <Button size="sm"
                                                                                                    onClick={this.onMarkArchived.bind(this, invoice.id)}>
                                                                                                Mark as archived
                                                                                            </Button>
                                                                                        ) : null}
                                                                                    </div>
                                                                                ) : null}
                                                                            </div>
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                            {payments.length ? (
                                                <thead className="payment-footer">
                                                <tr>
                                                    <td>Total</td>
                                                    <td/>
                                                    <td/>
                                                    <td>€{sumInvoices(payments) - sumInvoices(credi_nota)} </td>
                                                    <td/>
                                                </tr>
                                                </thead>
                                            ) : null}
                                        </Table>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {isClient() && !isAdmin() ? null : (
                            <div className="section">
                                <div className="section-title">Payouts</div>
                                {isPayAdminOrPM() && !project.archived ? (
                                    <div className="section-action">
                                        <Button size="sm"
                                                onClick={this.onCreateInvoice.bind(this, INVOICE_TYPE_PURCHASE)}>
                                            <Icon name="add"/> Add payout
                                        </Button>
                                    </div>
                                ) : null}

                                {batchPayouts.length ? (
                                    <div className="payment-list table-responsive">
                                        <Table striped>
                                            <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Date</th>
                                                <th>Developer</th>
                                                <th>Invoice</th>
                                                <th>Amount</th>
                                                <th/>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {batchPayouts.map(batch => {
                                                return (
                                                    <tr key={batch.id}>
                                                        <td style={{width: "30%"}}>{batch.title}</td>
                                                        <td style={{width: "20%"}}>
                                                            {batch.invoices.map(item => {
                                                                return (
                                                                    <div
                                                                        key={item.id}>{moment.utc(item.issued_at).format('DD/MMM/YYYY')}</div>
                                                                );
                                                            })}
                                                        </td>
                                                        <td style={{width: "25%"}}>
                                                            {batch.invoices.map(item => {
                                                                return (
                                                                    <div key={item.id}>{item.user.display_name}</div>
                                                                );
                                                            })}
                                                        </td>
                                                        <td style={{width: "10%"}}>
                                                            {batch.invoices.map(item => {
                                                                return (
                                                                    <div key={item.id}>
                                                                        <a href={`${ENDPOINT_INVOICES}${item.id}/download/?format=pdf`}
                                                                           target="_blank">
                                                                            {item.number}
                                                                        </a>
                                                                    </div>
                                                                );
                                                            })}
                                                        </td>
                                                        <td style={{width: "15%"}}>
                                                            {batch.invoices.map(item => {
                                                                return (
                                                                    <div key={item.id}>€{item.amount}</div>
                                                                );
                                                            })}
                                                            {isDev() ? null : (
                                                                <div className="subtotal">€{batch.amount}</div>
                                                            )}
                                                        </td>
                                                        <td style={{width: "10%"}}>
                                                            {isPayAdminOrPM() && !project.archived && !batch.paid && batch.status !== 'approved' ? (
                                                                <div className="actions text-right">
                                                                    <IconButton name="colon" size={null}
                                                                                onClick={this.onToggleActions.bind(this, batch.ref)}/>
                                                                    {this.state.open === batch.ref ? (
                                                                        <div className="dropper">
                                                                            <Button size="sm"
                                                                                    onClick={this.onUpdateInvoiceBatch.bind(this, batch.ref, batch.invoices)}>
                                                                                Edit payout
                                                                            </Button>
                                                                            <Button size="sm"
                                                                                    onClick={this.onDeleteInvoiceBatch.bind(this, batch.ref, batch.invoices)}>
                                                                                Delete payout
                                                                            </Button>
                                                                            {isPayAdmin() && !batch.paid ? (
                                                                                <Button size="sm"
                                                                                        onClick={this.onApprovePayout.bind(this, batch.ref, batch.invoices)}>
                                                                                    Approve payout
                                                                                </Button>
                                                                            ) : null}
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            ) : batch.paid ? (
                                                                <div>
                                                                    <Icon name="check" className="green"/> Paid
                                                                </div>
                                                            ) : batch.status === 'approved' ? (
                                                                <div>Processing</div>
                                                            ) : null}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                            {batchPayouts.length ? (
                                                <thead className="payment-footer">
                                                <tr>
                                                    <th>Total</th>
                                                    <th/>
                                                    <th/>
                                                    <th/>
                                                    <th>€{sumInvoices(batchPayouts)}</th>
                                                    <th/>
                                                </tr>
                                                </thead>
                                            ) : null}
                                        </Table>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {isAdmin() ? (
                            <div className="section">
                                <div className="section-title">Margin</div>
                                <p>€{project.margin}</p>
                            </div>

                        ) : null}
                    </div>
                )}
            </div>
        );
    }
}
