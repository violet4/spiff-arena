const submitWithUser = (
    username,
    password,
    processInstanceId,
    expectAdditionalApprovalInfoPage = false,
    approvaltype
) => {
    cy.wait(2000);
    cy.log('========Login with : ', username);
    cy.log('========processInstanceId: ', processInstanceId);
    cy.login(username, password);

    cy.wait(1000);
    cy.log('=======visit find by id : ');
    cy.visit('/admin/process-instances/find-by-id');
    cy.get('#process-instance-id-input').type(processInstanceId);

    cy.get('button')
        .contains(/^Submit$/)
        .click();

    cy.contains('Tasks I can complete', { timeout: 60000 });

    cy.get('.cds--btn').contains(/^Go$/).click();

    cy.wait(2000);
    // approve!
    if (approvaltype === "approve") {
        cy.get('#root > label:nth-child(1)').click();
        cy.get('.cds--text-area__wrapper').find('#root').type(username.concat(' is approving this.'));
    } else if (approvaltype === "reject") {
        cy.get('#root > label:nth-child(3)').click();
        cy.get('.cds--text-area__wrapper').find('#root').type(username.concat(' is rejecting this.'));
    } else if (approvaltype === "needmoreinfo") {
        cy.get('#root > label:nth-child(2)').click();
        cy.get('.cds--text-area__wrapper').find('#root').type(username.concat(' needs additional info. The term, learning and development, encompasses any professional development a business provides to its employees END.'));
    } else if (approvaltype === "providemoreinfo") {
        //Form 1
        cy.contains('Task: Submit New Demand Request Details', { timeout: 60000 });
        cy.get('button')
            .contains(/^Submit$/)
            .click();
        //Form 2      
        cy.contains('Task: Enter NDR Items', { timeout: 60000 });
        cy.get('button')
            .contains(/^Submit$/)
            .click();
        //Form 3
        cy.contains(
            'Review and provide any supporting information or files for your request.',
            { timeout: 60000 });

        cy.get('.cds--text-area__wrapper').find('#root').clear().type('Providing additional info. Learning and development (L&D) is a function within an organization that is responsible for empowering employees\’ growth and developing their knowledge, skills, and capabilities to drive better business performance.');

        cy.contains('Submit the Request').click();
        cy.get('input[value="Submit the Request"]').click();

    } else {

    }

    cy.get('button')
        .contains(/^Submit$/)
        .click();

    if (expectAdditionalApprovalInfoPage) {
        cy.contains(expectAdditionalApprovalInfoPage, { timeout: 60000 });

        cy.get('button')
            .contains(/^Continue$/)
            .click();

    }
    cy.location({ timeout: 60000 }).should((loc) => {
        expect(loc.pathname).to.eq('/tasks');
    });
    cy.wait(2000);
    cy.logout();
    cy.wait(2000);
};

//Learning and Development Path - Without Files
describe('Learning and Development Path - Without Files', () => {

    Cypress._.times(1, () => {
        //People Ops Partner Group approves the request
        it('Books Only. People Ops Partner Group approves', () => {
            let username = Cypress.env('requestor_username');
            let password = Cypress.env('requestor_password');
            cy.log('=====username : ' + username);
            cy.log('=====password : ' + password);

            cy.login(username, password);
            cy.visit('/');

            cy.contains('Start New +').click();
            cy.contains('Raise New Demand Request');

            cy.runPrimaryBpmnFile(true);

            cy.contains('Please select the type of request to start the process.');
            // wait a second to ensure we can click the radio button

            cy.wait(2000);
            cy.get('input#root-procurement').click();
            cy.wait(2000);


            cy.get('button')
                .contains(/^Submit$/)
                .click();

            cy.contains(
                'Submit a new demand request for the procurement of needed items',
                { timeout: 60000 }
            );

            cy.url().then((currentUrl) => {
                // if url is "/tasks/8/d37c2f0f-016a-4066-b669-e0925b759560"
                // extract the digits after /tasks
                const processInstanceId = currentUrl.match(/(?<=\/tasks\/)\d+/)[0];
                cy.log('==###############===processInstanceId : ', processInstanceId);
                let projectId = Cypress.env('project_id');
                cy.get('#root_project').select(projectId);
                cy.get('#root_category').select('learn_and_dev');
                cy.get('#root_purpose').clear().type('A L&D strategy should be aligned to the organization’s business strategy and goals with the aim of developing the workforce’s capability and driving business results.');
                cy.get('#root_criticality').select('High');
                cy.get('#root_period').clear().type('2025-11-25');
                cy.get('#root_vendor').clear().type('AIHR');
                cy.get('#root_payment_method').select('Debit Card');
                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Task: Enter NDR Items', { timeout: 60000 });
                cy.get('#root_0_sub_category').select('books');
                cy.get('#root_0_item').clear().type('A bounty is a payment or reward of money to locate');
                cy.get('#root_0_qty').clear().type('2');
                cy.get('#root_0_currency_type').select('Fiat');
                cy.get('#root_0_currency').select('AUD');
                cy.get('#root_0_unit_price').type('2416');


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains(
                    'Review and provide any supporting information or files for your request.',
                    { timeout: 60000 }
                );

                cy.get('.cds--text-area__wrapper').find('#root').type('A L&D strategy should be aligned to the organization\’s business strategy and goals with the aim of developing the workforce\’s capability and driving business results.');

                cy.contains('Submit the Request').click();

                cy.get('input[value="Submit the Request"]').click();


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();


                cy.contains('Tasks for my open instances', { timeout: 60000 });
                cy.logout();

                let peopleOpsUsername = Cypress.env('peopleopssme_username');
                let peopleOpsPassword = Cypress.env('peopleopssme_password');
                cy.log('=====peopleOpsUsername : ' + peopleOpsUsername);
                cy.log('=====peopleOpsPassword : ' + peopleOpsPassword);

                submitWithUser(
                    peopleOpsUsername,
                    peopleOpsPassword,
                    processInstanceId,
                    null,
                    "approve"
                );

            });
        });

        //People Ops Partner Group rejects the request
        it('Books Only. People Ops Partner Group rejects', () => {
            let username = Cypress.env('requestor_username');
            let password = Cypress.env('requestor_password');
            cy.log('=====username : ' + username);
            cy.log('=====password : ' + password);

            cy.login(username, password);
            cy.visit('/');

            cy.contains('Start New +').click();
            cy.contains('Raise New Demand Request');

            cy.runPrimaryBpmnFile(true);

            cy.contains('Please select the type of request to start the process.');
            // wait a second to ensure we can click the radio button

            cy.wait(2000);
            cy.get('input#root-procurement').click();
            cy.wait(2000);


            cy.get('button')
                .contains(/^Submit$/)
                .click();

            cy.contains(
                'Submit a new demand request for the procurement of needed items',
                { timeout: 60000 }
            );

            cy.url().then((currentUrl) => {
                // if url is "/tasks/8/d37c2f0f-016a-4066-b669-e0925b759560"
                // extract the digits after /tasks
                const processInstanceId = currentUrl.match(/(?<=\/tasks\/)\d+/)[0];
                cy.log('==###############===processInstanceId : ', processInstanceId);
                let projectId = Cypress.env('project_id');
                cy.get('#root_project').select(projectId);
                cy.get('#root_category').select('learn_and_dev');
                cy.get('#root_purpose').clear().type('Learning and development (L&D) is a function within an organization that is responsible for empowering employees’ growth and developing their knowledge, skills, and capabilities to drive better business performance. ');
                cy.get('#root_criticality').select('Medium');
                cy.get('#root_period').clear().type('2024-02-06');
                cy.get('#root_vendor').clear().type('EYK Books');
                cy.get('#root_payment_method').select('Bank Transfer');
                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Task: Enter NDR Items', { timeout: 60000 });
                cy.get('#root_0_sub_category').select('books');
                cy.get('#root_0_item').clear().type('The role of the L&D function has evolved to meet the demands of digital transformation and a modern workforce.');
                cy.get('#root_0_qty').clear().type('5');
                cy.get('#root_0_currency_type').select('Fiat');
                cy.get('#root_0_currency').select('EUR');
                cy.get('#root_0_unit_price').type('250');


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains(
                    'Review and provide any supporting information or files for your request.',
                    { timeout: 60000 }
                );

                cy.get('.cds--text-area__wrapper').find('#root').type('The function may be organized centrally, either independently or sitting under human resources (HR); decentralized throughout different business units; or be a hybrid (sometimes referred to as federated) structure.');

                cy.contains('Submit the Request').click();

                cy.get('input[value="Submit the Request"]').click();


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Tasks for my open instances', { timeout: 60000 });
                cy.logout();

                let peopleOpsUsername = Cypress.env('peopleopssme_username');
                let peopleOpsPassword = Cypress.env('peopleopssme_password');
                cy.log('=====peopleOpsUsername : ' + peopleOpsUsername);
                cy.log('=====peopleOpsPassword : ' + peopleOpsPassword);

                submitWithUser(
                    peopleOpsUsername,
                    peopleOpsPassword,
                    processInstanceId,
                    null,
                    "reject"
                );

            });
        });

        //People Ops Partner Group request for additional details
        it('Books Only. People Ops Partner Group needs more info', () => {
            let username = Cypress.env('requestor_username');
            let password = Cypress.env('requestor_password');
            cy.log('=====username : ' + username);
            cy.log('=====password : ' + password);

            cy.login(username, password);
            cy.visit('/');

            cy.contains('Start New +').click();
            cy.contains('Raise New Demand Request');

            cy.runPrimaryBpmnFile(true);

            cy.contains('Please select the type of request to start the process.');
            // wait a second to ensure we can click the radio button

            cy.wait(2000);
            cy.get('input#root-procurement').click();
            cy.wait(2000);


            cy.get('button')
                .contains(/^Submit$/)
                .click();

            cy.contains(
                'Submit a new demand request for the procurement of needed items',
                { timeout: 60000 }
            );

            cy.url().then((currentUrl) => {
                // if url is "/tasks/8/d37c2f0f-016a-4066-b669-e0925b759560"
                // extract the digits after /tasks
                const processInstanceId = currentUrl.match(/(?<=\/tasks\/)\d+/)[0];
                cy.log('==###############===processInstanceId : ', processInstanceId);
                let projectId = Cypress.env('project_id');
                cy.get('#root_project').select(projectId);
                cy.get('#root_category').select('learn_and_dev');
                cy.get('#root_purpose').clear().type('A comprehensive collection of the concepts, definitions, and methodologies for the profession can be found in the. \nhttps://www.aihr.com/blog/learning-and-development/');
                cy.get('#root_criticality').select('Low');
                cy.get('#root_period').clear().type('2025-02-25');
                cy.get('#root_vendor').clear().type('BOUNTY');
                cy.get('#root_payment_method').select('Crypto Transfer');
                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Task: Enter NDR Items', { timeout: 60000 });
                cy.get('#root_0_sub_category').select('books');
                cy.get('#root_0_item').clear().type('There are many different roles that make up a learning and development team or fall under the umbrel');
                cy.get('#root_0_qty').clear().type('4');
                cy.get('#root_0_currency_type').select('Crypto');
                cy.get('#root_0_currency').select('SNT');
                cy.get('#root_0_unit_price').type('450');


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains(
                    'Review and provide any supporting information or files for your request.',
                    { timeout: 60000 }
                );

                cy.get('.cds--text-area__wrapper').find('#root').type('Current and aspiring talent development professionals can enhance their skills with the various professional education courses offered by ATD Education \nhttps://www.aihr.com/blog/learning-and-development/');

                cy.contains('Submit the Request').click();

                cy.get('input[value="Submit the Request"]').click();


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Tasks for my open instances', { timeout: 60000 });
                cy.logout();

                let peopleOpsUsername = Cypress.env('peopleopssme_username');
                let peopleOpsPassword = Cypress.env('peopleopssme_password');
                cy.log('=====peopleOpsUsername : ' + peopleOpsUsername);
                cy.log('=====peopleOpsPassword : ' + peopleOpsPassword);

                submitWithUser(
                    peopleOpsUsername,
                    peopleOpsPassword,
                    processInstanceId,
                    null,
                    "needmoreinfo"
                );

                //requestor sending additional info
                submitWithUser(
                    username,
                    password,
                    processInstanceId,
                    null,
                    "providemoreinfo"
                );

                //people ops approves second time
                submitWithUser(
                    peopleOpsUsername,
                    peopleOpsPassword,
                    processInstanceId,
                    null,
                    "approve"
                );


            });
        });

        //Budget owner approves and People Ops Partner Group approves the request
        it('NOT Books Only. Budget owner approves and People Ops Partner Group approves', () => {
            let username = Cypress.env('requestor_username');
            let password = Cypress.env('requestor_password');
            cy.log('=====username : ' + username);
            cy.log('=====password : ' + password);

            cy.login(username, password);
            cy.visit('/');

            cy.contains('Start New +').click();
            cy.contains('Raise New Demand Request');

            cy.runPrimaryBpmnFile(true);

            cy.contains('Please select the type of request to start the process.');
            // wait a second to ensure we can click the radio button

            cy.wait(2000);
            cy.get('input#root-procurement').click();
            cy.wait(2000);


            cy.get('button')
                .contains(/^Submit$/)
                .click();

            cy.contains(
                'Submit a new demand request for the procurement of needed items',
                { timeout: 60000 }
            );

            cy.url().then((currentUrl) => {
                // if url is "/tasks/8/d37c2f0f-016a-4066-b669-e0925b759560"
                // extract the digits after /tasks
                const processInstanceId = currentUrl.match(/(?<=\/tasks\/)\d+/)[0];
                cy.log('==###############===processInstanceId : ', processInstanceId);
                let projectId = Cypress.env('project_id');
                cy.get('#root_project').select(projectId);
                cy.get('#root_category').select('learn_and_dev');
                cy.get('#root_purpose').clear().type('In 2019, the Association for Talent Development (ATD) conducted a competency study to assess needed talent development capabilities. The research found that the knowledge, skills, and attitudes (KSAs) of effective talent development professionals');
                cy.get('#root_criticality').select('High');
                cy.get('#root_period').clear().type('2025-11-25');
                cy.get('#root_vendor').clear().type('Lynda.com');
                cy.get('#root_payment_method').select('Reimbursement');
                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Task: Enter NDR Items', { timeout: 60000 });
                //item 0
                cy.get('#root_0_sub_category').select('on_conf');
                cy.get('#root_0_item').clear().type('The goal of learning and development is to develop or change the behavior of individuals or groups');
                cy.get('#root_0_qty').clear().type('2');
                cy.get('#root_0_currency_type').select('Fiat');
                cy.get('#root_0_currency').select('AUD');
                cy.get('#root_0_unit_price').type('2416');

                cy.get('#root > div:nth-child(3) > p > button').click();

                //item 1
                cy.get('#root_1_sub_category').select('course');
                cy.get('#root_1_item').clear().type('The goal of learning and development is to change the behavior of individuals or groups for better');
                cy.get('#root_1_qty').clear().type('1');
                cy.get('#root_1_currency_type').select('Crypto');
                cy.get('#root_1_currency').select('DAI');
                cy.get('#root_1_unit_price').type('2450');

                cy.get('#root > div:nth-child(3) > p > button').click();

                //item 2
                cy.get('#root_2_sub_category').select('books');
                cy.get('#root_2_item').clear().type('A L&D strategy should be aligned to the organization\’s business strategy');
                cy.get('#root_2_qty').clear().type('6');
                cy.get('#root_2_currency_type').select('Crypto');
                cy.get('#root_2_currency').select('SNT');
                cy.get('#root_2_unit_price').type('2300');



                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains(
                    'Review and provide any supporting information or files for your request.',
                    { timeout: 60000 }
                );

                cy.get('.cds--text-area__wrapper').find('#root').type('Learning and development is a systematic process to enhance an employee\’s skills, knowledge, and competency, resulting in better performance in a work setting. \nhttps://www.aihr.com/blog/learning-and-development/');

                cy.contains('Submit the Request').click();

                cy.get('input[value="Submit the Request"]').click();


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();


                cy.contains('Tasks for my open instances', { timeout: 60000 });
                cy.logout();

                let peopleOpsUsername = Cypress.env('peopleopssme_username');
                let peopleOpsPassword = Cypress.env('peopleopssme_password');
                cy.log('=====peopleOpsUsername : ' + peopleOpsUsername);
                cy.log('=====peopleOpsPassword : ' + peopleOpsPassword);

                let budgetOwnerUsername = Cypress.env('budgetowner_username');
                let budgetOwnerPassword = Cypress.env('budgetowner_password');
                cy.log('=====budgetOwnerUsername : ' + budgetOwnerUsername);
                cy.log('=====budgetOwnerPassword : ' + budgetOwnerPassword);

                submitWithUser(
                    budgetOwnerUsername,
                    budgetOwnerPassword,
                    processInstanceId,
                    'Task: Reminder: Request Additional Budget',
                    "approve"
                );

                submitWithUser(
                    peopleOpsUsername,
                    peopleOpsPassword,
                    processInstanceId,
                    null,
                    "approve"
                );

            });
        });

        //Budget owner rejects the request
        it('NOT Books Only. Budget owner rejects', () => {
            let username = Cypress.env('requestor_username');
            let password = Cypress.env('requestor_password');
            cy.log('=====username : ' + username);
            cy.log('=====password : ' + password);

            cy.login(username, password);
            cy.visit('/');

            cy.contains('Start New +').click();
            cy.contains('Raise New Demand Request');

            cy.runPrimaryBpmnFile(true);

            cy.contains('Please select the type of request to start the process.');
            // wait a second to ensure we can click the radio button

            cy.wait(2000);
            cy.get('input#root-procurement').click();
            cy.wait(2000);


            cy.get('button')
                .contains(/^Submit$/)
                .click();

            cy.contains(
                'Submit a new demand request for the procurement of needed items',
                { timeout: 60000 }
            );

            cy.url().then((currentUrl) => {
                // if url is "/tasks/8/d37c2f0f-016a-4066-b669-e0925b759560"
                // extract the digits after /tasks
                const processInstanceId = currentUrl.match(/(?<=\/tasks\/)\d+/)[0];
                cy.log('==###############===processInstanceId : ', processInstanceId);
                let projectId = Cypress.env('project_id');
                cy.get('#root_project').select(projectId);
                cy.get('#root_category').select('learn_and_dev');
                cy.get('#root_purpose').clear().type('Learning and development is a systematic process to enhance an employee\’s skills, knowledge, and competency, resulting in better performance in a work setting. \nhttps://www.aihr.com/blog/learning-and-development/');
                cy.get('#root_criticality').select('Medium');
                cy.get('#root_period').clear().type('2024-02-06');
                cy.get('#root_vendor').clear().type('Udemy Courses');
                cy.get('#root_payment_method').select('Bank Transfer');
                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Task: Enter NDR Items', { timeout: 60000 });
                cy.get('#root_0_sub_category').select('course');
                cy.get('#root_0_item').clear().type('There are many different roles that make up a learning and development team or fall under the');
                cy.get('#root_0_qty').clear().type('5');
                cy.get('#root_0_currency_type').select('Fiat');
                cy.get('#root_0_currency').select('EUR');
                cy.get('#root_0_unit_price').type('250');


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains(
                    'Review and provide any supporting information or files for your request.',
                    { timeout: 60000 }
                );

                cy.get('.cds--text-area__wrapper').find('#root').type('A L&D strategy should be aligned to the organization\’s business strategy and goals with the aim of developing the workforce\’s capability and driving business results.');

                cy.contains('Submit the Request').click();

                cy.get('input[value="Submit the Request"]').click();


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Tasks for my open instances', { timeout: 60000 });
                cy.logout();

                let budgetOwnerUsername = Cypress.env('budgetowner_username');
                let budgetOwnerPassword = Cypress.env('budgetowner_password');
                cy.log('=====budgetOwnerUsername : ' + budgetOwnerUsername);
                cy.log('=====budgetOwnerPassword : ' + budgetOwnerPassword);

                submitWithUser(
                    budgetOwnerUsername,
                    budgetOwnerPassword,
                    processInstanceId,
                    null,
                    "reject"
                );

            });
        });

        //Budget owner request for additional details
        it('NOT Books Only. Budget owner needs more info', () => {
            let username = Cypress.env('requestor_username');
            let password = Cypress.env('requestor_password');
            cy.log('=====username : ' + username);
            cy.log('=====password : ' + password);

            cy.login(username, password);
            cy.visit('/');

            cy.contains('Start New +').click();
            cy.contains('Raise New Demand Request');

            cy.runPrimaryBpmnFile(true);

            cy.contains('Please select the type of request to start the process.');
            // wait a second to ensure we can click the radio button

            cy.wait(2000);
            cy.get('input#root-procurement').click();
            cy.wait(2000);


            cy.get('button')
                .contains(/^Submit$/)
                .click();

            cy.contains(
                'Submit a new demand request for the procurement of needed items',
                { timeout: 60000 }
            );

            cy.url().then((currentUrl) => {
                // if url is "/tasks/8/d37c2f0f-016a-4066-b669-e0925b759560"
                // extract the digits after /tasks
                const processInstanceId = currentUrl.match(/(?<=\/tasks\/)\d+/)[0];
                cy.log('==###############===processInstanceId : ', processInstanceId);
                let projectId = Cypress.env('project_id');
                cy.get('#root_project').select(projectId);
                cy.get('#root_category').select('learn_and_dev');
                cy.get('#root_purpose').clear().type('Research found that the knowledge, skills, and attitudes (KSAs) of effective talent development professionals, at every level of their career, fell into three major domains of practice.');
                cy.get('#root_criticality').select('Low');
                cy.get('#root_period').clear().type('2025-02-25');
                cy.get('#root_vendor').clear().type('Conference LTD');
                cy.get('#root_payment_method').select('Crypto Transfer');
                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Task: Enter NDR Items', { timeout: 60000 });
                cy.get('#root_0_sub_category').select('on_conf');
                cy.get('#root_0_item').clear().type('Learning and development is a systematic process to enhance an employee\’s skills');
                cy.get('#root_0_qty').clear().type('4');
                cy.get('#root_0_currency_type').select('Crypto');
                cy.get('#root_0_currency').select('SNT');
                cy.get('#root_0_unit_price').type('450');


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains(
                    'Review and provide any supporting information or files for your request.',
                    { timeout: 60000 }
                );

                cy.get('.cds--text-area__wrapper').find('#root').type('Learning and development is a systematic process to enhance an employee\’s skills, knowledge, and competency, resulting in better performance in a work setting. \nhttps://www.aihr.com/blog/learning-and-development/');

                cy.contains('Submit the Request').click();

                cy.get('input[value="Submit the Request"]').click();


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Tasks for my open instances', { timeout: 60000 });
                cy.logout();

                let budgetOwnerUsername = Cypress.env('budgetowner_username');
                let budgetOwnerPassword = Cypress.env('budgetowner_password');
                cy.log('=====budgetOwnerUsername : ' + budgetOwnerUsername);
                cy.log('=====budgetOwnerPassword : ' + budgetOwnerPassword);

                submitWithUser(
                    budgetOwnerUsername,
                    budgetOwnerPassword,
                    processInstanceId,
                    null,
                    "needmoreinfo"
                );

                //requestor sending additional info
                submitWithUser(
                    username,
                    password,
                    processInstanceId,
                    null,
                    "providemoreinfo"
                );

                //budget owner approves second time
                submitWithUser(
                    budgetOwnerUsername,
                    budgetOwnerPassword,
                    processInstanceId,
                    'Task: Reminder: Request Additional Budget',
                    "approve"
                );


            });
        });

    });

});

//Learning and Development Path - With Files
describe('Learning and Development Path - With Files', () => {

    Cypress._.times(1, () => {
        //People Ops Partner Group approves the request
        it('Books Only. People Ops Partner Group approves', () => {
            let username = Cypress.env('requestor_username');
            let password = Cypress.env('requestor_password');
            cy.log('=====username : ' + username);
            cy.log('=====password : ' + password);

            cy.login(username, password);
            cy.visit('/');

            cy.contains('Start New +').click();
            cy.contains('Raise New Demand Request');

            cy.runPrimaryBpmnFile(true);

            cy.contains('Please select the type of request to start the process.');
            // wait a second to ensure we can click the radio button

            cy.wait(2000);
            cy.get('input#root-procurement').click();
            cy.wait(2000);


            cy.get('button')
                .contains(/^Submit$/)
                .click();

            cy.contains(
                'Submit a new demand request for the procurement of needed items',
                { timeout: 60000 }
            );

            cy.url().then((currentUrl) => {
                // if url is "/tasks/8/d37c2f0f-016a-4066-b669-e0925b759560"
                // extract the digits after /tasks
                const processInstanceId = currentUrl.match(/(?<=\/tasks\/)\d+/)[0];
                cy.log('==###############===processInstanceId : ', processInstanceId);
                let projectId = Cypress.env('project_id');
                cy.get('#root_project').select(projectId);
                cy.get('#root_category').select('learn_and_dev');
                cy.get('#root_purpose').clear().type('Learning and development is a systematic process to enhance an employee\’s skills, knowledge, and competency, resulting in better performance in a work setting. \nhttps://www.aihr.com/blog/learning-and-development/');
                cy.get('#root_criticality').select('High');
                cy.get('#root_period').clear().type('2025-11-25');
                cy.get('#root_vendor').clear().type('Training Industry');
                cy.get('#root_payment_method').select('Bank Transfer');
                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Task: Enter NDR Items', { timeout: 60000 });
                cy.get('#root_0_sub_category').select('books');
                cy.get('#root_0_item').clear().type('A L&D strategy should be aligned to the organization\’s business strategy and goals');
                cy.get('#root_0_qty').clear().type('2');
                cy.get('#root_0_currency_type').select('Fiat');
                cy.get('#root_0_currency').select('AUD');
                cy.get('#root_0_unit_price').type('2416');


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains(
                    'Review and provide any supporting information or files for your request.',
                    { timeout: 60000 }
                );

                cy.get('.cds--text-area__wrapper').find('#root').type('A L&D strategy should be aligned to the organization\’s business strategy and goals with the aim of developing the workforce\’s capability and driving business results.');

                cy.get("input[type=file]")
                    .attachFile(['lorem-ipsum.pdf', 'png-5mb-1.png', 'Free_Test_Data_1MB_PDF.pdf', 'sampletext.txt']);

                cy.contains('Submit the Request').click();

                cy.get('input[value="Submit the Request"]').click();


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();


                cy.contains('Tasks for my open instances', { timeout: 60000 });
                cy.logout();

                let peopleOpsUsername = Cypress.env('peopleopssme_username');
                let peopleOpsPassword = Cypress.env('peopleopssme_password');
                cy.log('=====peopleOpsUsername : ' + peopleOpsUsername);
                cy.log('=====peopleOpsPassword : ' + peopleOpsPassword);

                submitWithUser(
                    peopleOpsUsername,
                    peopleOpsPassword,
                    processInstanceId,
                    null,
                    "approve"
                );

            });
        });

        //People Ops Partner Group rejects the request
        it('Books Only. People Ops Partner Group rejects', () => {
            let username = Cypress.env('requestor_username');
            let password = Cypress.env('requestor_password');
            cy.log('=====username : ' + username);
            cy.log('=====password : ' + password);

            cy.login(username, password);
            cy.visit('/');

            cy.contains('Start New +').click();
            cy.contains('Raise New Demand Request');

            cy.runPrimaryBpmnFile(true);

            cy.contains('Please select the type of request to start the process.');
            // wait a second to ensure we can click the radio button

            cy.wait(2000);
            cy.get('input#root-procurement').click();
            cy.wait(2000);


            cy.get('button')
                .contains(/^Submit$/)
                .click();

            cy.contains(
                'Submit a new demand request for the procurement of needed items',
                { timeout: 60000 }
            );

            cy.url().then((currentUrl) => {
                // if url is "/tasks/8/d37c2f0f-016a-4066-b669-e0925b759560"
                // extract the digits after /tasks
                const processInstanceId = currentUrl.match(/(?<=\/tasks\/)\d+/)[0];
                cy.log('==###############===processInstanceId : ', processInstanceId);
                let projectId = Cypress.env('project_id');
                cy.get('#root_project').select(projectId);
                cy.get('#root_category').select('learn_and_dev');
                cy.get('#root_purpose').clear().type('The goal of learning and development is to develop or change the behavior of individuals or groups for the better, sharing knowledge and insights that enable them to do their work better, or cultivate attitudes that help them perform better');
                cy.get('#root_criticality').select('Medium');
                cy.get('#root_period').clear().type('2024-02-06');
                cy.get('#root_vendor').clear().type('EYK Books');
                cy.get('#root_payment_method').select('Bank Transfer');
                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Task: Enter NDR Items', { timeout: 60000 });
                cy.get('#root_0_sub_category').select('books');
                cy.get('#root_0_item').clear().type('There are many different roles that make up a learning and development team or fall');
                cy.get('#root_0_qty').clear().type('5');
                cy.get('#root_0_currency_type').select('Fiat');
                cy.get('#root_0_currency').select('EUR');
                cy.get('#root_0_unit_price').type('250');


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains(
                    'Review and provide any supporting information or files for your request.',
                    { timeout: 60000 }
                );

                cy.get('.cds--text-area__wrapper').find('#root').type('Learning and development is a systematic process to enhance an employee\’s skills, knowledge, and competency, resulting in better performance in a work setting. \nhttps://www.aihr.com/blog/learning-and-development/');

                cy.get("input[type=file]")
                    .attachFile(['lorem-ipsum.pdf', 'png-5mb-1.png', 'Free_Test_Data_1MB_PDF.pdf', 'sampletext.txt']);

                cy.contains('Submit the Request').click();

                cy.get('input[value="Submit the Request"]').click();


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Tasks for my open instances', { timeout: 60000 });
                cy.logout();

                let peopleOpsUsername = Cypress.env('peopleopssme_username');
                let peopleOpsPassword = Cypress.env('peopleopssme_password');
                cy.log('=====peopleOpsUsername : ' + peopleOpsUsername);
                cy.log('=====peopleOpsPassword : ' + peopleOpsPassword);

                submitWithUser(
                    peopleOpsUsername,
                    peopleOpsPassword,
                    processInstanceId,
                    null,
                    "reject"
                );

            });
        });

        //People Ops Partner Group request for additional details
        it('Books Only. People Ops Partner Group needs more info', () => {
            let username = Cypress.env('requestor_username');
            let password = Cypress.env('requestor_password');
            cy.log('=====username : ' + username);
            cy.log('=====password : ' + password);

            cy.login(username, password);
            cy.visit('/');

            cy.contains('Start New +').click();
            cy.contains('Raise New Demand Request');

            cy.runPrimaryBpmnFile(true);

            cy.contains('Please select the type of request to start the process.');
            // wait a second to ensure we can click the radio button

            cy.wait(2000);
            cy.get('input#root-procurement').click();
            cy.wait(2000);


            cy.get('button')
                .contains(/^Submit$/)
                .click();

            cy.contains(
                'Submit a new demand request for the procurement of needed items',
                { timeout: 60000 }
            );

            cy.url().then((currentUrl) => {
                // if url is "/tasks/8/d37c2f0f-016a-4066-b669-e0925b759560"
                // extract the digits after /tasks
                const processInstanceId = currentUrl.match(/(?<=\/tasks\/)\d+/)[0];
                cy.log('==###############===processInstanceId : ', processInstanceId);
                let projectId = Cypress.env('project_id');
                cy.get('#root_project').select(projectId);
                cy.get('#root_category').select('learn_and_dev');
                cy.get('#root_purpose').clear().type('A L&D strategy should be aligned to the organization\’s business strategy and goals with the aim of developing the workforce\’s capability and driving business results.');
                cy.get('#root_criticality').select('Low');
                cy.get('#root_period').clear().type('2025-02-25');
                cy.get('#root_vendor').clear().type('Conference LTD');
                cy.get('#root_payment_method').select('Crypto Transfer');
                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Task: Enter NDR Items', { timeout: 60000 });
                cy.get('#root_0_sub_category').select('books');
                cy.get('#root_0_item').clear().type('Learning and development is a systematic process to enhance an employee\’s skills');
                cy.get('#root_0_qty').clear().type('4');
                cy.get('#root_0_currency_type').select('Crypto');
                cy.get('#root_0_currency').select('SNT');
                cy.get('#root_0_unit_price').type('450');


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains(
                    'Review and provide any supporting information or files for your request.',
                    { timeout: 60000 }
                );

                cy.get('.cds--text-area__wrapper').find('#root').type('Learning, training, and development are often used interchangeably. However, there are subtle differences between these concepts, which are shown in the table below. \nhttps://www.aihr.com/blog/learning-and-development/');

                cy.get("input[type=file]")
                    .attachFile(['lorem-ipsum.pdf', 'png-5mb-1.png', 'Free_Test_Data_1MB_PDF.pdf', 'sampletext.txt']);

                cy.contains('Submit the Request').click();

                cy.get('input[value="Submit the Request"]').click();


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Tasks for my open instances', { timeout: 60000 });
                cy.logout();

                let peopleOpsUsername = Cypress.env('peopleopssme_username');
                let peopleOpsPassword = Cypress.env('peopleopssme_password');
                cy.log('=====peopleOpsUsername : ' + peopleOpsUsername);
                cy.log('=====peopleOpsPassword : ' + peopleOpsPassword);

                submitWithUser(
                    peopleOpsUsername,
                    peopleOpsPassword,
                    processInstanceId,
                    null,
                    "needmoreinfo"
                );

                //requestor sending additional info
                submitWithUser(
                    username,
                    password,
                    processInstanceId,
                    null,
                    "providemoreinfo"
                );

                //people ops approves second time
                submitWithUser(
                    peopleOpsUsername,
                    peopleOpsPassword,
                    processInstanceId,
                    null,
                    "approve"
                );


            });
        });

        //Budget owner approves and People Ops Partner Group approves the request
        it('NOT Books Only. Budget owner approves and People Ops Partner Group approves', () => {
            let username = Cypress.env('requestor_username');
            let password = Cypress.env('requestor_password');
            cy.log('=====username : ' + username);
            cy.log('=====password : ' + password);

            cy.login(username, password);
            cy.visit('/');

            cy.contains('Start New +').click();
            cy.contains('Raise New Demand Request');

            cy.runPrimaryBpmnFile(true);

            cy.contains('Please select the type of request to start the process.');
            // wait a second to ensure we can click the radio button

            cy.wait(2000);
            cy.get('input#root-procurement').click();
            cy.wait(2000);


            cy.get('button')
                .contains(/^Submit$/)
                .click();

            cy.contains(
                'Submit a new demand request for the procurement of needed items',
                { timeout: 60000 }
            );

            cy.url().then((currentUrl) => {
                // if url is "/tasks/8/d37c2f0f-016a-4066-b669-e0925b759560"
                // extract the digits after /tasks
                const processInstanceId = currentUrl.match(/(?<=\/tasks\/)\d+/)[0];
                cy.log('==###############===processInstanceId : ', processInstanceId);
                let projectId = Cypress.env('project_id');
                cy.get('#root_project').select(projectId);
                cy.get('#root_category').select('learn_and_dev');
                cy.get('#root_purpose').clear().type('Learning and development is a systematic process to enhance an employee\’s skills, knowledge, and competency, resulting in better performance in a work setting. \nhttps://www.aihr.com/blog/learning-and-development/');
                cy.get('#root_criticality').select('High');
                cy.get('#root_period').clear().type('2025-11-25');
                cy.get('#root_vendor').clear().type('The Leadership Laboratory');
                cy.get('#root_payment_method').select('Crypto Transfer');
                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                //item 0
                cy.contains('Task: Enter NDR Items', { timeout: 60000 });
                cy.get('#root_0_sub_category').select('on_conf');
                cy.get('#root_0_item').clear().type('There are many different roles that make up a learning and development team');
                cy.get('#root_0_qty').clear().type('2');
                cy.get('#root_0_currency_type').select('Fiat');
                cy.get('#root_0_currency').select('AUD');
                cy.get('#root_0_unit_price').type('2416');

                cy.get('#root > div:nth-child(3) > p > button').click();

                //item 1
                cy.get('#root_1_sub_category').select('course');
                cy.get('#root_1_item').clear().type('The goal of learning and development is to change the behavior of individuals or groups for better');
                cy.get('#root_1_qty').clear().type('1');
                cy.get('#root_1_currency_type').select('Fiat');
                cy.get('#root_1_currency').select('CAD');
                cy.get('#root_1_unit_price').type('1355');

                cy.get('#root > div:nth-child(3) > p > button').click();

                //item 2
                cy.get('#root_2_sub_category').select('books');
                cy.get('#root_2_item').clear().type('A L&D strategy should be aligned to the organization\’s business strategy');
                cy.get('#root_2_qty').clear().type('6');
                cy.get('#root_2_currency_type').select('Crypto');
                cy.get('#root_2_currency').select('SNT');
                cy.get('#root_2_unit_price').type('2300');


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains(
                    'Review and provide any supporting information or files for your request.',
                    { timeout: 60000 }
                );

                cy.get('.cds--text-area__wrapper').find('#root').type('A L&D strategy should be aligned to the organization\’s business strategy and goals with the aim of developing the workforce\’s capability and driving business results.');

                cy.get("input[type=file]")
                    .attachFile(['lorem-ipsum.pdf', 'png-5mb-1.png', 'Free_Test_Data_1MB_PDF.pdf', 'sampletext.txt']);

                cy.contains('Submit the Request').click();

                cy.get('input[value="Submit the Request"]').click();


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();


                cy.contains('Tasks for my open instances', { timeout: 60000 });
                cy.logout();

                let peopleOpsUsername = Cypress.env('peopleopssme_username');
                let peopleOpsPassword = Cypress.env('peopleopssme_password');
                cy.log('=====peopleOpsUsername : ' + peopleOpsUsername);
                cy.log('=====peopleOpsPassword : ' + peopleOpsPassword);

                let budgetOwnerUsername = Cypress.env('budgetowner_username');
                let budgetOwnerPassword = Cypress.env('budgetowner_password');
                cy.log('=====budgetOwnerUsername : ' + budgetOwnerUsername);
                cy.log('=====budgetOwnerPassword : ' + budgetOwnerPassword);

                submitWithUser(
                    budgetOwnerUsername,
                    budgetOwnerPassword,
                    processInstanceId,
                    'Task: Reminder: Request Additional Budget',
                    "approve"
                );

                submitWithUser(
                    peopleOpsUsername,
                    peopleOpsPassword,
                    processInstanceId,
                    null,
                    "approve"
                );

            });
        });

        //Budget owner rejects the request
        it('NOT Books Only. Budget owner rejects', () => {
            let username = Cypress.env('requestor_username');
            let password = Cypress.env('requestor_password');
            cy.log('=====username : ' + username);
            cy.log('=====password : ' + password);

            cy.login(username, password);
            cy.visit('/');

            cy.contains('Start New +').click();
            cy.contains('Raise New Demand Request');

            cy.runPrimaryBpmnFile(true);

            cy.contains('Please select the type of request to start the process.');
            // wait a second to ensure we can click the radio button

            cy.wait(2000);
            cy.get('input#root-procurement').click();
            cy.wait(2000);


            cy.get('button')
                .contains(/^Submit$/)
                .click();

            cy.contains(
                'Submit a new demand request for the procurement of needed items',
                { timeout: 60000 }
            );

            cy.url().then((currentUrl) => {
                // if url is "/tasks/8/d37c2f0f-016a-4066-b669-e0925b759560"
                // extract the digits after /tasks
                const processInstanceId = currentUrl.match(/(?<=\/tasks\/)\d+/)[0];
                cy.log('==###############===processInstanceId : ', processInstanceId);
                let projectId = Cypress.env('project_id');
                cy.get('#root_project').select(projectId);
                cy.get('#root_category').select('learn_and_dev');
                cy.get('#root_purpose').clear().type('The goal of learning and development is to develop or change the behavior of individuals or groups for the better, sharing knowledge and insights that enable them to do their work better, or cultivate attitudes that help them perform better');
                cy.get('#root_criticality').select('Medium');
                cy.get('#root_period').clear().type('2024-02-06');
                cy.get('#root_vendor').clear().type('Lynda.com');
                cy.get('#root_payment_method').select('Bank Transfer');
                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Task: Enter NDR Items', { timeout: 60000 });
                cy.get('#root_0_sub_category').select('course');
                cy.get('#root_0_item').clear().type('The goal of learning and development is to develop or change the behavior of individuals or groups');
                cy.get('#root_0_qty').clear().type('5');
                cy.get('#root_0_currency_type').select('Fiat');
                cy.get('#root_0_currency').select('EUR');
                cy.get('#root_0_unit_price').type('250');


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains(
                    'Review and provide any supporting information or files for your request.',
                    { timeout: 60000 }
                );

                cy.get('.cds--text-area__wrapper').find('#root').type('Learning and development is a systematic process to enhance an employee\’s skills, knowledge, and competency, resulting in better performance in a work setting. \nhttps://www.aihr.com/blog/learning-and-development/');

                cy.get("input[type=file]")
                    .attachFile(['lorem-ipsum.pdf', 'png-5mb-1.png', 'Free_Test_Data_1MB_PDF.pdf', 'sampletext.txt']);

                cy.contains('Submit the Request').click();

                cy.get('input[value="Submit the Request"]').click();


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Tasks for my open instances', { timeout: 60000 });
                cy.logout();

                let budgetOwnerUsername = Cypress.env('budgetowner_username');
                let budgetOwnerPassword = Cypress.env('budgetowner_password');
                cy.log('=====budgetOwnerUsername : ' + budgetOwnerUsername);
                cy.log('=====budgetOwnerPassword : ' + budgetOwnerPassword);

                submitWithUser(
                    budgetOwnerUsername,
                    budgetOwnerPassword,
                    processInstanceId,
                    null,
                    "reject"
                );

            });
        });

        //Budget owner request for additional details
        it('NOT Books Only. Budget owner needs more info', () => {
            let username = Cypress.env('requestor_username');
            let password = Cypress.env('requestor_password');
            cy.log('=====username : ' + username);
            cy.log('=====password : ' + password);

            cy.login(username, password);
            cy.visit('/');

            cy.contains('Start New +').click();
            cy.contains('Raise New Demand Request');

            cy.runPrimaryBpmnFile(true);

            cy.contains('Please select the type of request to start the process.');
            // wait a second to ensure we can click the radio button

            cy.wait(2000);
            cy.get('input#root-procurement').click();
            cy.wait(2000);


            cy.get('button')
                .contains(/^Submit$/)
                .click();

            cy.contains(
                'Submit a new demand request for the procurement of needed items',
                { timeout: 60000 }
            );

            cy.url().then((currentUrl) => {
                // if url is "/tasks/8/d37c2f0f-016a-4066-b669-e0925b759560"
                // extract the digits after /tasks
                const processInstanceId = currentUrl.match(/(?<=\/tasks\/)\d+/)[0];
                cy.log('==###############===processInstanceId : ', processInstanceId);
                let projectId = Cypress.env('project_id');
                cy.get('#root_project').select(projectId);
                cy.get('#root_category').select('learn_and_dev');
                cy.get('#root_purpose').clear().type('Learning, training, and development are often used interchangeably. However, there are subtle differences between these concepts, which are shown in the table below. ');
                cy.get('#root_criticality').select('Low');
                cy.get('#root_period').clear().type('2025-02-25');
                cy.get('#root_vendor').clear().type('Conference LTD');
                cy.get('#root_payment_method').select('Crypto Transfer');
                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Task: Enter NDR Items', { timeout: 60000 });
                cy.get('#root_0_sub_category').select('on_conf');
                cy.get('#root_0_item').clear().type('There are many different roles that make up a learning and development team');
                cy.get('#root_0_qty').clear().type('4');
                cy.get('#root_0_currency_type').select('Crypto');
                cy.get('#root_0_currency').select('SNT');
                cy.get('#root_0_unit_price').type('450');


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains(
                    'Review and provide any supporting information or files for your request.',
                    { timeout: 60000 }
                );

                cy.get('.cds--text-area__wrapper').find('#root').type('A L&D strategy should be aligned to the organization\’s business strategy and goals with the aim of developing the workforce\’s capability and driving business results.');

                cy.get("input[type=file]")
                    .attachFile(['lorem-ipsum.pdf', 'png-5mb-1.png', 'Free_Test_Data_1MB_PDF.pdf', 'sampletext.txt']);

                cy.contains('Submit the Request').click();

                cy.get('input[value="Submit the Request"]').click();


                cy.get('button')
                    .contains(/^Submit$/)
                    .click();

                cy.contains('Tasks for my open instances', { timeout: 60000 });
                cy.logout();

                let budgetOwnerUsername = Cypress.env('budgetowner_username');
                let budgetOwnerPassword = Cypress.env('budgetowner_password');
                cy.log('=====budgetOwnerUsername : ' + budgetOwnerUsername);
                cy.log('=====budgetOwnerPassword : ' + budgetOwnerPassword);

                submitWithUser(
                    budgetOwnerUsername,
                    budgetOwnerPassword,
                    processInstanceId,
                    null,
                    "needmoreinfo"
                );

                //requestor sending additional info
                submitWithUser(
                    username,
                    password,
                    processInstanceId,
                    null,
                    "providemoreinfo"
                );

                //budget owner approves second time
                submitWithUser(
                    budgetOwnerUsername,
                    budgetOwnerPassword,
                    processInstanceId,
                    'Task: Reminder: Request Additional Budget',
                    "approve"
                );

                let peopleOpsUsername = Cypress.env('peopleopssme_username');
                let peopleOpsPassword = Cypress.env('peopleopssme_password');
                cy.log('=====peopleOpsUsername : ' + peopleOpsUsername);
                cy.log('=====peopleOpsPassword : ' + peopleOpsPassword);

                submitWithUser(
                    peopleOpsUsername,
                    peopleOpsPassword,
                    processInstanceId,
                    null,
                    "approve"
                );


            });
        });

    });
});