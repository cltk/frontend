
ReadingLayout = React.createClass({

	// This mixin makes the getMeteorData method work
	mixins: [ReactMeteorData],

	textLocation: [],
	isTextRemaining: true,

	propTypes: {
		params: React.PropTypes.object.isRequired,
		queryParams: React.PropTypes.object.isRequired
	},

  getInitialState(){
    return {
      toggleCommentary: false,
      toggleDefinitions: false,
      toggleTranslations: false,
      filters: [],
			location: [],
			limit: 30
    };
  },

	getMeteorData() {
		let query = {};
		let textNodes = [];

		let work = Works.findOne({_id: this.props.params.id});


		if(work){

			// Get the work authors
			work.authors = Authors.find({ _id : {$in: work.authors} }).fetch()

			/*
			 * Should be the slug when the text sync / ingest is reworked
			 */
			//query = {work: work.slug};
			query = {work: work.title};

			if(this.state.location.length === 5){
				query.n_5 = {$gte: this.textLocation[4]};
				query.n_4 = this.textLocation[3];
				query.n_3 = this.textLocation[2];
				query.n_2 = this.textLocation[1];
				query.n_1 = this.textLocation[0];
			}else if(this.state.location.length >= 4){
				query.n_4 = {$gte: this.textLocation[3]};
				query.n_3 = this.textLocation[2];
				query.n_2 = this.textLocation[1];
				query.n_1 = this.textLocation[0];
			}else if(this.state.location.length >= 3){
				query.n_3 = {$gte: this.textLocation[2]};
				query.n_2 = this.textLocation[1];
				query.n_1 = this.textLocation[0];
			}else if(this.state.location.length >= 2){
				query.n_2 = {$gte: this.textLocation[1]};
				query.n_1 = this.textLocation[0];
			}else if(this.state.location.length >= 1){
				query.n_1 = {$gte: this.textLocation[0]};
			}

			console.log("ReadingLayout text Query:", query);

			let handle = Meteor.subscribe('textNodes', query, this.state.limit);
	    if(handle.ready()) {
		    textNodes = Texts.find({}, {}).fetch();
			}

			if(textNodes.length){
				if("rangeN5" in work){
						if(this.textLocation.length === 0){
							this.textLocation = [1,1,1,1,1];
						}else {
							if(work.rangeN5.high === textNodes[textNodes.length-1].n_5){
								this.textLocation[3]++;
								this.textLocation[4] = 1;
							}else {
								this.textLocation[4] += this.state.limit;

							}

						}
				}else if("rangeN4" in work){
						if(this.textLocation.length === 0){
							this.textLocation = [1,1,1,1];
						}else {
							if(work.rangeN4.high === textNodes[textNodes.length-1].n_4){
								this.textLocation[2]++;
								this.textLocation[3] = 1;
							}else {
								this.textLocation[3] += this.state.limit;

							}

						}
				}else if("rangeN3" in work){
						if(this.textLocation.length === 0){
							this.textLocation = [1,1,1];
						}else {
							if(work.rangeN3.high === textNodes[textNodes.length-1].n_3){
								this.textLocation[1]++;
								this.textLocation[2] = 1;
							}else {
								this.textLocation[2] += this.state.limit;

							}
						}
				}else if("rangeN2" in work){
						if(this.textLocation.length === 0){
							this.textLocation = [1,1];
						}else {
							if(work.rangeN2.high === textNodes[textNodes.length-1].n_2){
								this.textLocation[0]++;
								this.textLocation[1] = 1;
							}else {
								this.textLocation[1] += this.state.limit;

							}
						}
				}else if("rangeN1" in work){
						if(this.textLocation.length === 0){
							this.textLocation = [1];
						}else {
							if(work.rangeN1.high === textNodes[textNodes.length-1].n_1){
								this.isTextRemaining = false;
							}else {
								this.textLocation[0] += this.state.limit;

							}
						}
				}

			}

		}else {
			console.log("Reading query: work not available for _id", this.props.params.id)
		}



		return {
			work: work,
			textNodes: textNodes,
			currentUser: Meteor.user()
		};

	},

	loadMore(){
		if(this.isTextRemaining){
	    this.setState({
	      location : this.textLocation
	    });
			console.log("Load more:", this.state);

		}
	},

	toggleSidePanel(metadata){
		if(metadata==="definitions"){
			let toggle = !this.state.toggleDefinitions;
			this.setState({
				toggleDefinitions: toggle
			});
		}
		if(metadata==="commentary"){
			let toggle = !this.state.toggleCommentary;
			this.setState({
				toggleCommentary: toggle
			});
		}
		if(metadata==="translations"){
			let toggle = !this.state.toggleTranslations;
			this.setState({
				toggleTranslations: toggle
			});
		}
	},

	renderReadingEnvironment(){
		let work = this.data.work;
		let textNodes = this.data.textNodes;
		// If data is loaded
		if(work && textNodes){

			// Infer Reading layout by the work meta structure value
			if(['line', 'poem-line', 'book-line'].indexOf(work.structure)){
				// Render reading poetry here instead of Prose
	      return (
	          <ReadingProse
	            work={work}
	            textNodes={textNodes}
							loadMore={this.loadMore}
	            highlightId={this.props.queryParams.id} />
	        );

	    }else {
	      return (
	          <ReadingProse
	            work={work}
	            textNodes={textNodes}
							loadMore={this.loadMore}
	            highlightId={this.props.queryParams.id} />
	        );

	    }

		}

	},

	render(){

		let readingClassName = "";
		if(this.state.toggleCommentary||this.state.toggleTranslations) {
			readingClassName += " with-commentary-shown";
		}

		if(this.state.toggleDefinitions) {
			readingClassName += " with-definitions-shown";
		}

		return(
			<div className="cltk-layout reading-layout">
				<HeaderReading
					work={this.data.work}
					location={this.state.location}
					toggleSidePanel={this.toggleSidePanel}
					toggleDefinitions={this.state.toggleDefinitions}
					toggleCommentary={this.state.toggleCommentary}
					toggleTranslations={this.state.toggleTranslations}
					/>

				<main>
			      <div id="reading" className={readingClassName}>
			        {this.renderReadingEnvironment()}
			      </div>
				</main>

				{/*<AnnotateWidget />*/}

				<DefinitionsPanel
					toggleDefinitions={this.state.toggleDefinitions}
					textNodes={this.data.textNodes} />

				<CommentaryPanel
					toggleCommentary={this.state.toggleCommentary}
					toggleTranslations={this.state.toggleTranslations}
					work={this.data.work.title}
					textNodes={this.data.textNodes} />

			</div>
			);
	}

});
