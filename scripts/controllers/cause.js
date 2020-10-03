import extend from '../../utils/context.js';
import models from '../models/index.js'
import docModifier from '../../utils/doc-modifier.js'

export default {
    get: {
        dashboard(context) {
            models.cause.getAll().then(response => {
            
                const causes = response.docs.map(docModifier);

                context.causes = causes;

                console.log(causes);
                extend(context).then(function() {
                    this.partial('../../views/causes/dashboard.hbs');
                })
            })
        },

        create(context) {
            extend(context).then(function() {
                this.partial('../../views/causes/create.hbs');
            })
        },

        details(context) {
            const {causeId} = context.params;

            models.cause.get(causeId).then(response => {
                const cause = docModifier(response);

                console.log(cause);
                
                Object.keys(cause).forEach((key) => {
                    context[key] = cause[key];
                })

                context.canDonate = (cause.uid !== localStorage.getItem('userId'));
                console.log(context.canDonate);

                extend(context).then(function() {
                    this.partial('../../views/causes/details.hbs');
                })
            }).catch(err => {
                console.error(err);
            })
        }
    },

    post: {
        create(context) {
            const data = {
                ...context.params,
                uid: localStorage.getItem('userId'),
                collectedFunds: 0,
                donors: []
            }
            models.cause.create(data).then(response => {
                context.redirect('#/cause/dashboard');
            })
            .catch(err => {
                console.error(err);
            })
        }
    },

    del: {
        close(context) {
            const { caseId } = context.params;
            models.cause.close(caseId).then(response => {
                context.redirect('#/cause/dashboard');
            });
        }
    },

    put: {
        donate(context) {
            const {caseId, donatedAmount} = context.params;

            models.cause.get(caseId).then(response => {
                const cause = docModifier(response);
                cause.collectedFunds += Number(donatedAmount);
                cause.donors.push(localStorage.getItem('userEmail'));
                return models.cause.donate(caseId, cause)
            })
            .then(response => {
                context.redirect('#/cause/dashboard');
            })
        }
    }
};