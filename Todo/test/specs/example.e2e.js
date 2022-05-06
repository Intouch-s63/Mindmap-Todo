var chai = require('chai');
describe('Todo App using React Native', () => {
    it('Add Todo', async () => {

		const Add = await $("~Add");
		await Add.click();

		const AddTitle = await $("~AddTitle");
		await AddTitle.addValue("Buy Milk")

		const AddDesc = await $("~AddDesc");
		await AddDesc.addValue("2 box of milk")

		const AddDate = await $("~AddDate");
		await AddDate.click();

		const date = await $("~28 April 2022");
		await date.click();

		const dateOK = await $("//android.widget.Button['resource-id = android:id/button1']")
		await dateOK.click();

		const AddSubmit = await $("~AddSubmit");
		await AddSubmit.click();
		await AddSubmit.waitForExist({reverse: true});
		
		const checkTitle = await $("(//android.view.ViewGroup[@content-desc='Todo'])[1]/android.view.ViewGroup/android.view.ViewGroup/android.widget.TextView[1]").getText();
		chai.expect(checkTitle).to.equal('Buy Milk');
		
    });
	it('Add second todo', async () => {

		const Add = await $("~Add");
		await Add.click();

		const AddTitle = await $("~AddTitle");
		await AddTitle.addValue("Buy Chocolate Cake")

		const AddDesc = await $("~AddDesc");
		await AddDesc.addValue("2 pcs")

		const AddDate = await $("~AddDate");
		await AddDate.click();

		const date = await $("~28 April 2022");
		await date.click();

		const dateOK = await $("//android.widget.Button['resource-id = android:id/button1']")
		await dateOK.click();

		const AddSubmit = await $("~AddSubmit");
		await AddSubmit.click();
		await AddSubmit.waitForExist({reverse: true});
		
		const checkTitle = await $("(//android.view.ViewGroup[@content-desc='Todo'])[2]/android.view.ViewGroup/android.view.ViewGroup/android.widget.TextView[1]").getText();
		chai.expect(checkTitle).to.equal('Buy Chocolate Cake');
		
    });
	it('View Description', async () => {

		await browser.pause(1000);

		const Detail = await $("~Detail");
		await Detail.click();

		const desc = await $("~desc").getText()  
		chai.expect(desc).to.equal('2 box of milk')

		const Add = await $("~Add");
		await Add.click();

    });
	it('Edit Todo', async () => {

		await browser.pause(2000);
		
		const Edit = await $("~Edit");
		await Edit.click();

		const EditTitle = await $("~EditTitle");
		await EditTitle.clearValue();
		await EditTitle.addValue("Buy Water");

		const EditDesc = await $("~EditDesc");
		await EditDesc.clearValue(); 
		await EditDesc.addValue("2 bottles");

		const EditDate = await $("~EditDate");
		await EditDate.click();

		const date = await $("~25 April 2022");
		await date.click();

		const dateOK = await $("//android.widget.Button['resource-id = android:id/button1']");
		await dateOK.click();

		const Save = await $("~Save");
		await Save.click();
		await Save.waitForExist({reverse: true});
		
		await browser.pause(3000);
		
		const checkTitle = await $("(//android.view.ViewGroup[@content-desc='Todo'])[1]/android.view.ViewGroup/android.view.ViewGroup/android.widget.TextView[1]").getText();
		chai.expect(checkTitle).to.equal('Buy Water');
		
		await $("~Detail").click();
		const desc = await $("~desc").getText() 
		chai.expect(desc).to.equal('2 bottles');

		const Add = await $("~Add");
		await Add.click();
		
	});
	it('Click Star', async () => {
		
		await browser.pause(2000);

		const Star = await $("~Star");
		await Star.click();
		
		await browser.pause(3000);

		const truestar = await $("(//android.view.ViewGroup[@content-desc='Star'])[1]/android.widget.ImageView");
		const attr = await truestar.getAttribute('content-desc');
		chai.expect(attr).to.equal('truestar');
		
	});
	it('Click Checkbox', async () => {

		await browser.pause(2000);

		const Checkbox = await $("~Checkbox");
		await Checkbox.click();

		await browser.pause(3000);

		const attr = await Checkbox.getAttribute('checked');
		chai.expect(attr).to.equal('true');

		const CompleteTab = await $("/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.View/android.view.View[2]");
		await CompleteTab.click();

		await browser.pause(2000);

		const checkTitle = await $("(//android.view.ViewGroup[@content-desc='CompletedTodo'])[1]/android.view.ViewGroup/android.view.ViewGroup/android.widget.TextView[1]").getText();
		chai.expect(checkTitle).to.equal('Buy Water');

		const CheckboxCompleted = await $("~CheckboxCompleted");
		await CheckboxCompleted.click();

		await browser.pause(3000);

		const NowTab = await $("/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.View/android.view.View[1]/android.view.ViewGroup");
		await NowTab.click();

		const Checkbox_now = await $("~Checkbox");

		const attr_now = await Checkbox_now.getAttribute('checked');
		chai.expect(attr_now).to.equal('false');

	});
	it('Search Todo', async () => {

		const NowTab = await $("/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.View/android.view.View[1]/android.view.ViewGroup");
		await NowTab.click();

		await browser.pause(2000);

		const Search = await $("~Search");
		await Search.addValue("Buy Water");

		const checkTitle = await $("(//android.view.ViewGroup[@content-desc='Todo'])[1]/android.view.ViewGroup/android.view.ViewGroup/android.widget.TextView[1]").getText();
		chai.expect(checkTitle).to.equal('Buy Water');

		await Search.clearValue();

	});
	it('Delete Todo in Completed Tab', async () => {

		await browser.pause(2000);

		const CompleteTab = await $("/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.View/android.view.View[2]");
		await CompleteTab.click();

		await browser.pause(2000);

		const CompletedTodo = await $("~CompletedTodo");

		const Delete = await $("~DeleteCompletedTodo");
		await Delete.click();

		const DeleteConF = await $("~DeleteCompletedTodoConF");
		await DeleteConF.click();
		await DeleteConF.waitForExist({reverse: true});

		await browser.pause(2000);

		await CompletedTodo.waitForExist({reverse: true});

	});
	it('Delete Todo', async () => {

		await browser.pause(2000);

		const NowTab = await $("/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.View/android.view.View[1]/android.view.ViewGroup");
		await NowTab.click();

		await browser.pause(2000);

		const Todo = await $("~Todo");

		const Delete = await $("~Delete");
		await Delete.click();

		const DeleteConF = await $("~DeleteConF");
		await DeleteConF.click();
		await DeleteConF.waitForExist({reverse: true});

		await browser.pause(2000);

		await Todo.waitForExist({reverse: true});
  
	});
});