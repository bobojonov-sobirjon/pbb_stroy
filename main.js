const API_BASE_URL = 'https://api.rvv-stroi.ru/api';
const PROJECTS_ENDPOINT = '/projects/';
const CLIENT_REVIEWS_ENDPOINT = '/client-reviews/';
const WORK_STEPS_ENDPOINT = '/work-steps/';
const WHY_CHOOSE_US_ENDPOINT = '/why-choose-us/';
const CATEGORIES_ENDPOINT = '/categories/';
const SERVICE_DETAILS_ENDPOINT = '/service-details/';
const YOUTUBE_VIDEOS_ENDPOINT = '/youtube-videos/';
const YOUTUBE_INCREMENT_VIEWS_ENDPOINT = '/youtube-videos/increment-views/';

const youtubeVideosState = {
	itemsById: new Map(),
	eventsBound: false,
};

async function ensureAxios() {
	if (window.axios) return window.axios;

	await new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
		script.onload = resolve;
		script.onerror = () => reject(new Error('Axios yuklanmadi'));
		document.head.appendChild(script);
	});

	return window.axios;
}

function getProjectsFromResponse(data) {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.results)) return data.results;
	return [];
}

function getClientReviewsFromResponse(data) {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.results)) return data.results;
	return [];
}

function getWorkStepsFromResponse(data) {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.results)) return data.results;
	return [];
}

function getWhyChooseUsFromResponse(data) {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.results)) return data.results;
	return [];
}

function getCategoriesFromResponse(data) {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.results)) return data.results;
	return [];
}

function getServiceDetailsFromResponse(data) {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.service_details)) return data.service_details;
	if (Array.isArray(data?.results)) return data.results;
	return [];
}

function getYoutubeVideosFromResponse(data) {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.results)) return data.results;
	return [];
}

function escapeHtml(value) {
	return String(value ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function renderProjectsSlides(projects) {
	const wrapper = document.querySelector('.swiper-projects .swiper-wrapper');
	if (!wrapper) return;

	if (!projects.length) {
		wrapper.innerHTML = '';
		return;
	}

	wrapper.innerHTML = projects
		.map(
			(project) => `
        <div class="swiper-slide">
          <a href="${project.image}" data-fancybox="projects-gallery" class="block border-10 border-[#fff] max-[601px]:border-5 rounded-[15px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]">
            <img src="${project.image}" alt="project-${project.id}" class="w-full h-[317px] object-cover rounded-[10px] max-[901px]:h-auto max-[901px]:aspect-video">
          </a>
        </div>
      `
		)
		.join('');
}

function renderProjectsMobile(projects) {
	const container = document.querySelector('.projects-mob');
	if (!container) return;

	if (!projects.length) {
		container.innerHTML = '';
		return;
	}

	// Faqat 4 ta ko‘rsatamiz
	const firstFour = projects.slice(0, 4);

	container.innerHTML = firstFour.map(project => `
		<div class="p-[5px] bg-white shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] overflow-hidden rounded-[15px]" data-aos="fade-up">
			<img 
				src="${project.image}" 
				alt="project-${project.id}"
				class="block w-full h-full object-cover object-center aspect-[73/55] rounded-[10px]"
				loading="lazy">
		</div>
	`).join('');

	const cards = container.querySelectorAll('div');
	const lastCard = cards[3];

	// Fancybox faqat oxirgi cardga
	if (lastCard && window.Fancybox) {
		lastCard.style.cursor = "pointer";

		lastCard.addEventListener("click", () => {
			const galleryItems = projects.map(p => ({
				src: p.image,
				type: "image"
			}));

			// 5-rasmdan ochiladi
			const startIndex = projects.length > 4 ? 4 : 0;

			window.Fancybox.show(galleryItems, {
				startIndex
			});
		});
	}

	if (window.AOS?.refresh) {
		window.AOS.refresh();
	}
}

function updateProjectsSlider() {
	const sliderEl = document.querySelector('.swiper-projects');
	const instance = sliderEl?.swiper;

	if (instance) {
		instance.update();
		instance.slideTo(0);
	}

	if (window.Fancybox?.bind) {
		if (window.Fancybox.unbind) {
			window.Fancybox.unbind('[data-fancybox="projects-gallery"]');
		}
		window.Fancybox.bind('[data-fancybox="projects-gallery"]', {});
	}
}

function renderRatingStars(rating) {
	const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
	return Array.from({ length: safeRating })
		.map(
			() => `
      <img class="w-[30px] max-[401px]:w-[15px]" src="svg/star.svg" alt="star.svg" fetchpriority="low"
        loading="lazy" referrerpolicy="origin-when-cross-origin" width="30"
        height="30">
    `
		)
		.join('');
}

function renderClientReviewsSlides(reviews) {
	const wrapper = document.querySelector('.swiper-comments .swiper-wrapper');
	if (!wrapper) return;

	if (!reviews.length) {
		wrapper.innerHTML = '';
		return;
	}

	wrapper.innerHTML = reviews
		.map((review) => {
			const rawFullName = String(review.full_name ?? '');
			const fullName = escapeHtml(rawFullName);
			const comment = escapeHtml(review.comment);
			const firstLetter = escapeHtml(rawFullName.trim().charAt(0).toUpperCase() || '?');
			const stars = renderRatingStars(review.rating);

			return `
        <div class="swiper-slide">
          <div class="w-full h-full rounded-[15px] h-[stretch] md:border-10 border-5 border-white shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] md:p-[20px_30px] p-[15px] flex flex-col justify-between md:gap-y-[20px] gap-y-2">
            <div>
              <div class="rounded-full bg-[#552A00] w-[70px] h-[70px] max-[401px]:w-[30px] max-[401px]:h-[30px] text-[40px] max-[401px]:text-[15px] font-semibold mx-auto leading-[100%] text-center content-center text-white">${firstLetter}</div>
              <h1 class="text-[20px] font-medium leading-[normal] mt-[20px] max-[401px]:mt-[7px] max-[401px]:text-[14px]">${fullName}</h1>
              <p class="text-lg font-extralight leading-[normal] block mt-[10px] max-[401px]:text-[12px]">${comment}</p>
            </div>
            <div class="flex items-center gap-x-[6px]">
              ${stars}
            </div>
          </div>
        </div>
      `;
		})
		.join('');
}

function updateClientReviewsSlider() {
	const sliderEl = document.querySelector('.swiper-comments');
	const instance = sliderEl?.swiper;

	if (instance) {
		instance.update();
		instance.slideTo(0);
	}
}

function getStepImageByNumber(stepNumber, image) {
	if (image) return image;

	const num = Number(stepNumber);
	if (Number.isFinite(num) && num >= 1 && num <= 5) {
		return `imgs/steeps/steep (${num}).png`;
	}

	return 'imgs/steeps/steps.png';
}

function renderWorkStepsCards(steps) {
	const grid = document.querySelector('#step-cards');
	if (!grid || !steps.length) return;

	const staticLastCard = Array.from(grid.children).find((item) =>
		item.textContent?.includes('Свяжитесь')
	);

	const sortedSteps = [...steps].sort(
		(a, b) => Number(a.step_number || 0) - Number(b.step_number || 0)
	);

	const dynamicMarkup = sortedSteps
		.map((step) => {
			const stepNumber = Number(step.step_number) || 0;
			const safeTitle = escapeHtml(step.title);
			const safeDescription = escapeHtml(step.description);
			const safeImage = escapeHtml(getStepImageByNumber(stepNumber, step.image));
			const numberLabel = String(stepNumber || '').padStart(2, '0');

			return `
        <div class="relative rounded-[15px] bg-white p-[10px] max-[601px]:p-[5px] overflow-hidden h-auto" data-aos="fade-up">
          <img src="${safeImage}" alt="steep.png" fetchpriority="low"
            loading="lazy"
            referrerpolicy="origin-when-cross-origin"
            class="w-full h-full block object-cover object-center rounded-[10px]">
          <div class="absolute inset-[20px] max-[601px]:inset-[10px] flex flex-col justify-between">
            <h1 class="text-[40px] text-white leading-[normal] font-medium text-end mt-[15px] mr-[15px] max-[601px]:m-[0] max-[601px]:text-[30px] max-[551px]:text-xl">${numberLabel}</h1>
            <div class="rounded-[10px] max-[401px]:p-[7px] border-[0.2px] border-white bg-[rgba(152,152,152,0.60)] p-[15px] min-h-[98px]">
              <h2 class="text-[25px] max-[769px]:text-[20px] font-medium leading-[normal] text-[#FFEBA2] mb-[10px] max-[551px]:mb-[5px] max-[551px]:text-base max-[421px]:text-sm max-[401px]:text-[10px]">${safeTitle}</h2>
              <p class="text-lg max-[551px]:text-sm leading-[normal] font-normal text-white max-[421px]:text-xs max-[401px]:text-[10px]">${safeDescription}</p>
            </div>
          </div>
        </div>
      `;
		})
		.join('');

	grid.innerHTML = dynamicMarkup;

	if (staticLastCard) {
		grid.appendChild(staticLastCard);
	}
}

function renderWhyChooseUsCards(items) {
	const grid = document.getElementById('choose-grid');
	if (!grid || !items.length) return;

	const sortedItems = [...items].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

	grid.innerHTML = sortedItems
		.map((item, index) => {
			const safeTitle = escapeHtml(item.title);
			const safeDescription = escapeHtml(item.description);
			const offset = window.innerWidth >= 900 ? 2 : 1;
			const shouldShowDivider = index < Math.max(0, sortedItems.length - offset);

			return `
        <div class="flex flex-col justify-between gap-y-[66px] max-[901px]:gap-y-[30px] h-full" data-aos="fade-up">
          <div class="flex items-start gap-x-[20px]">
            <div class="rounded-full bg-[#FFC700] w-[40px] h-[40px] max-[901px]:w-[30px] max-[901px]:h-[30px] shrink-[0] shadow-[0_4px_4px_rgba(0,0,0,0.25)] content-center">
              <img class="max-[901px]:w-[15px] mx-auto" src="svg/check.png" alt="check.png" fetchpriority="low" loading="lazy" width="25" height="25"
                class="block mx-auto">
            </div>
            <div class="w-full">
              <h1 class="uppercase text-[35px] max-[901px]:mb-[10px] max-[901px]:text-[25px] font-medium leading-[normal] mb-[20px] max-[401px]:text-[20px]">${safeTitle}</h1>
              <p class="text-xl font-extralight leading-[normal] max-[401px]:text-base">${safeDescription}</p>
            </div>
          </div>
          ${shouldShowDivider ? '<div class="w-full md:max-w-[270.008px] max-w-full md:h-[4px] h-[2px] bg-[#BB9200]"></div>' : ''}
        </div>
      `;
		})
		.join('');
}

async function fetchSubCategoryServiceDetails(axios, subCategoryId) {
	try {
		const response = await axios.get(`${API_BASE_URL}${SERVICE_DETAILS_ENDPOINT}`, {
			params: {
				sub_category_id: subCategoryId,
			},
			headers: {
				Accept: '*/*',
			},
		});

		return getServiceDetailsFromResponse(response.data);
	} catch (error) {
		console.error(`Service details API xatolik (sub_category_id=${subCategoryId}):`, error);
		return [];
	}
}

async function enrichCategoriesWithServiceDetails(axios, categories) {
	return Promise.all(
		categories.map(async (category) => {
			const subCategoryList = Array.isArray(category?.sub_category_list)
				? category.sub_category_list
				: [];

			const enrichedSubCategoryList = await Promise.all(
				subCategoryList.map(async (subCategory) => {
					const currentDetails = Array.isArray(subCategory?.service_details)
						? subCategory.service_details
						: [];

					if (currentDetails.length) {
						return {
							...subCategory,
							service_details: currentDetails,
						};
					}

					const serviceDetails = await fetchSubCategoryServiceDetails(axios, subCategory.id);
					return {
						...subCategory,
						service_details: serviceDetails,
					};
				})
			);

			return {
				...category,
				sub_category_list: enrichedSubCategoryList,
			};
		})
	);
}

function renderServicesCategories(categories) {
	const categoryContainer = document.getElementById('category');
	if (!categoryContainer || !categories.length) return;

	Array.from(categoryContainer.children).forEach((child) => {
		if (child.swiper && typeof child.swiper.destroy === 'function') {
			child.swiper.destroy(true, true);
		}
	});

	const activeCategories = categories.filter((category) => category?.is_active !== false);

	categoryContainer.innerHTML = activeCategories.reverse()
		.map((category) => {
			const categoryName = escapeHtml(category.name);
			const subCategories = Array.isArray(category?.sub_category_list)
				? category.sub_category_list.filter((subCategory) => subCategory?.is_active !== false)
				: [];

			const subCategoryList = subCategories
				.map(
					(subCategory) =>
						`<li class="text-lg font-normal leading-[100%] max-[651px]:text-base">${escapeHtml(subCategory.name)}</li>`
				)
				.join('');

			const serviceImages = subCategories
				.flatMap((subCategory) => {
					const details = Array.isArray(subCategory?.service_details)
						? [...subCategory.service_details]
						: [];
					return details.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
				})
				.map((detail) => detail?.image)
				.filter(Boolean)
				.slice(0, 12);

			const imageSlides = serviceImages
				.map((image) => {
					const safeImage = escapeHtml(image);
					return `
            <a class="swiper-slide h-auto block rounded-[15px] w-full border-10 border-[#FFF] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] content-center overflow-hidden" href="${safeImage}" data-fancybox="services-gallery-${category.id}">
                <img src="${safeImage}" alt="service.png" fetchpriority="low" loading="lazy"
                  class="w-full h-auto block object-cover object-center">
            </a>
          `;
				})
				.join('');

			return `
        <div id="service-category-${category.id}" class="swiper swiper-service" data-service-swiper="true" data-aos="fade-up">
          <div class="swiper-wrapper items-stretch">
            <div class="swiper-slide rounded-[15px] w-full h-full border-10 border-[#FFF] bg-[#F5F5F5] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] p-[23px] max-[651px]:p-[20px_10px]">
                <h1 class="text-[25px] max-[651px]:text-[20px] font-semibold">${categoryName}</h1>
                <ul class="mt-[20px] space-y-[10px] max-[651px]:mt-[10px] max-[651px]:marker:text-xl list-disc ml-[23px] marker:text-[30px] marker:text-[#FFC700]">
                  ${subCategoryList || '<li class="text-lg font-normal leading-[100%] max-[651px]:text-base block">Список услуг обновляется</li>'}
                </ul>
            </div>
            ${imageSlides}
          </div>
        </div>
      `;
		})
		.join('');
}

function initServiceCategorySwipers() {
	const categoryContainer = document.getElementById('category');
	if (!categoryContainer || !window.Swiper) return;

	Array.from(categoryContainer.querySelectorAll('[data-service-swiper="true"]')).forEach(
		(sliderElement) => {
			if (sliderElement.swiper && typeof sliderElement.swiper.destroy === 'function') {
				sliderElement.swiper.destroy(true, true);
			}

			new window.Swiper(sliderElement, {
				slidesPerView: 1.5,
				spaceBetween: 10,
				breakpoints: {
					1201: {
						slidesPerView: 4,
						spaceBetween: 30,
					},
					901: {
						slidesPerView: 3.5,
					},
					601: {
						slidesPerView: 2.5,
					},
					501: {
						slidesPerView: 2.3
					},
					351: {
						slidesPerView: 1.5
					},
					0: {
						slidesPerView: 1.3
					}
				}
			});
		}
	);

	if (window.Fancybox?.bind) {
		if (window.Fancybox.unbind) {
			window.Fancybox.unbind('[data-fancybox^="services-gallery-"]');
		}
		window.Fancybox.bind('[data-fancybox^="services-gallery-"]', {});
	}

	if (window.AOS?.refreshHard) {
		window.AOS.refreshHard();
		return;
	}

	if (window.AOS?.refresh) {
		window.AOS.refresh();
	}
}

function getYoutubePoster(video) {
	const thumbnail = String(video?.thumbnail || '').trim();
	if (thumbnail) return thumbnail;
	return 'imgs/services/service (1).png';
}

function getYoutubeEmbedUrl(youtubeUrl) {
	const rawUrl = String(youtubeUrl || '').trim();
	if (!rawUrl) return '';

	const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

	try {
		return new URL(normalizedUrl).toString();
	} catch (error) {
		return '';
	}
}

function renderYoutubeVideoCard(video, large = false) {
	const safeTitle = escapeHtml(video.title);
	const safeViews = Number(video.viewers || 0).toLocaleString('ru-RU');
	const safePoster = escapeHtml(getYoutubePoster(video));
	const buttonSize = large ? '150' : '80';
	const containerHeight = large ? 'h-[367px]' : 'h-[137.768px]';
	const titleClass = large
		? 'text-xl font-medium leading-[normal] max-[351px]:text-[15px]'
		: 'text-[15px] font-medium leading-[normal] max-[351px]:text-[14px]';

	return `
    <div class="w-full ${large ? 'max-w-[470.493px] max-[1201px]:max-w-full max-[1201px]:flex-1' : ''}" data-aos="fade-up">
      <div class="relative w-full ${containerHeight} max-[1201px]:h-auto max-[1201px]:aspect-video rounded-[20px] overflow-hidden shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] border-1 border-[#FFF]">
        <img src="${safePoster}" alt="blog.png" fetchpriority="low" loading="lazy"
          referrerpolicy="origin-when-cross-origin" class="w-full h-full object-center object-cover">
        <button
          type="button"
          data-yt-open="true"
          data-video-id="${video.id}"
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none cursor-pointer border-0 bg-transparent p-0 ${large ? "w-[150px] h-[150px] max-[1201px]:w-[80px] max-[1201px]:h-[80px]" : "w-[80px] h-[80px] max-[1201px]:w-[50px] max-[1201px]:h-[50px]"} ">
          <img src="svg/play.svg" alt="play.svg" fetchpriority="low" loading="lazy" width="${buttonSize}" height="${buttonSize}">
        </button>
      </div>
      <div class="mt-[20px] max-[768px]:mt-[10px]">
        <h1 class="${titleClass}">${safeTitle}</h1>
        <div class="flex items-center md:gap-x-[10px] gap-[5px] mt-[5px]">
          <img src="svg/yt-play.png" alt="yt-play.png" fetchpriority="low" loading="lazy" width="22" height="22"
            class="block w-[22px] h-[22px] max-[351px]:w-[15px] max-[351px]:h-[15px]">
          <span class="text-[15px] leading-[normal] max-[351px]:text-[12px] font-extralight">${safeViews}
            просмотров</span>
        </div>
      </div>
    </div>
  `;
}

function renderYoutubeVideos(videos) {
	const container = document.getElementById('youtube-videos');
	if (!container || !videos.length) return;

	const safeVideos = videos
		.filter((video) => video?.id && video?.youtube_url)
		.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

	if (!safeVideos.length) return;

	youtubeVideosState.itemsById = new Map(safeVideos.map((video) => [String(video.id), video]));

	const [featuredVideo, ...otherVideos] = safeVideos;
	const sideVideos = otherVideos.slice(0, 4);

	container.innerHTML = `
    ${renderYoutubeVideoCard(featuredVideo, true)}
    <div class="grid grid-cols-2 sm:gap-[30px] gap-[10px] max-[1201px]:flex-1 w-full">
      ${sideVideos.map((video) => renderYoutubeVideoCard(video)).join('')}
    </div>
  `;

	if (window.AOS?.refreshHard) {
		window.AOS.refreshHard();
		return;
	}

	if (window.AOS?.refresh) {
		window.AOS.refresh();
	}
}

async function incrementYoutubeViews(videoId) {
	try {
		const axios = await ensureAxios();
		await axios.post(`${API_BASE_URL}${YOUTUBE_INCREMENT_VIEWS_ENDPOINT}`, null, {
			params: { id: videoId },
			headers: {
				Accept: '*/*',
			},
		});
	} catch (error) {
		console.error(`Youtube increment xatolik (id=${videoId}):`, error);
	}
}

function openYoutubeVideoModal(video) {
	if (!window.Fancybox?.show) return;

	const videoId = String(video.id);
	const safeTitle = escapeHtml(video.title);
	const safePoster = escapeHtml(getYoutubePoster(video));
	const watchUrl = String(video.youtube_url || '').trim();
	const embedUrl = getYoutubeEmbedUrl(watchUrl);
	const safeWatchUrl = escapeHtml(watchUrl);
	const safeEmbedUrl = escapeHtml(embedUrl);
	const modalRoot = ensureYoutubeInlineModalRoot();

	modalRoot.innerHTML = `
    <div data-yt-modal="true" style="width:min(92vw,980px);">
      <div style="position:relative;width:100%;padding-top:56.25%;background:#000;border-radius:12px;overflow:hidden;" data-yt-frame-wrap="true">
        <img src="${safePoster}" alt="${safeTitle}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
        <button type="button" data-yt-modal-play="true" data-video-id="${videoId}" data-watch-url="${safeWatchUrl}" data-embed-url="${safeEmbedUrl}"
          style="position:absolute;inset:0;margin:auto;width:96px;height:96px;border:0;background:transparent;cursor:pointer;padding:0;">
          <img src="svg/play.svg" alt="play" width="96" height="96" style="display:block;width:96px;height:96px;">
        </button>
      </div>
    </div>
  `;

	window.Fancybox.show(
		[
			{
				src: '#youtube-inline-modal',
				type: 'inline',
			},
		],
		{
			on: {
				destroy: () => {
					modalRoot.innerHTML = '';
					loadYoutubeVideos();
				},
			},
		}
	);
}

function ensureYoutubeInlineModalRoot() {
	let modalRoot = document.getElementById('youtube-inline-modal');

	if (!modalRoot) {
		modalRoot = document.createElement('div');
		modalRoot.id = 'youtube-inline-modal';
		modalRoot.style.display = 'none';
		document.body.appendChild(modalRoot);
	}

	return modalRoot;
}

function bindYoutubeVideoEvents() {
	if (youtubeVideosState.eventsBound) return;

	const container = document.getElementById('youtube-videos');
	if (!container) return;

	container.addEventListener('click', (event) => {
		const trigger = event.target.closest('[data-yt-open="true"]');
		if (!trigger) return;
		event.preventDefault();

		const videoId = String(trigger.getAttribute('data-video-id') || '');
		const video = youtubeVideosState.itemsById.get(videoId);
		if (!video) return;

		openYoutubeVideoModal(video);
	});

	document.addEventListener('click', async (event) => {
		const playButton = event.target.closest('[data-yt-modal-play="true"]');
		if (!playButton) return;
		event.preventDefault();

		const wrap = playButton.closest('[data-yt-frame-wrap="true"]');
		if (!wrap) return;

		const videoId = String(playButton.getAttribute('data-video-id') || '');
		const watchUrl = String(playButton.getAttribute('data-watch-url') || '');
		const embedUrl = String(playButton.getAttribute('data-embed-url') || '');
		if (!videoId) return;

		playButton.disabled = true;
		await incrementYoutubeViews(videoId);
		if (embedUrl) {
			wrap.innerHTML = `
        <iframe
          src="${embedUrl}"
          title="Video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe>
      `;
			return;
		}

		wrap.innerHTML = `
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;padding:24px;text-align:center;">
        Не удалось открыть в модальном окне. <a href="${escapeHtml(watchUrl)}" target="_blank" rel="noopener noreferrer" style="margin-left:6px;text-decoration:underline;color:#fff;">Открыть видео</a>
      </div>
    `;
	});

	youtubeVideosState.eventsBound = true;
}

async function loadProjects() {
	try {
		const axios = await ensureAxios();
		const response = await axios.get(`${API_BASE_URL}${PROJECTS_ENDPOINT}`, {
			headers: {
				Accept: 'application/json',
			},
		});

		const projects = getProjectsFromResponse(response.data);
		if (window.innerWidth > 450) {
			renderProjectsSlides(projects);
			updateProjectsSlider();
		} else {
			renderProjectsMobile(projects);
		}
	} catch (error) {
		console.error('Projects API xatolik:', error);
	}
}

async function loadClientReviews() {
	try {
		const axios = await ensureAxios();
		const response = await axios.get(`${API_BASE_URL}${CLIENT_REVIEWS_ENDPOINT}`, {
			headers: {
				Accept: 'application/json',
			},
		});

		const reviews = getClientReviewsFromResponse(response.data);
		renderClientReviewsSlides(reviews);
		updateClientReviewsSlider();
	} catch (error) {
		console.error('Client reviews API xatolik:', error);
	}
}

async function loadWorkSteps() {
	try {
		const axios = await ensureAxios();
		const response = await axios.get(`${API_BASE_URL}${WORK_STEPS_ENDPOINT}`, {
			headers: {
				Accept: 'application/json',
			},
		});

		const steps = getWorkStepsFromResponse(response.data);
		renderWorkStepsCards(steps);
	} catch (error) {
		console.error('Work steps API xatolik:', error);
	}
}

async function loadWhyChooseUs() {
	try {
		const axios = await ensureAxios();
		const response = await axios.get(`${API_BASE_URL}${WHY_CHOOSE_US_ENDPOINT}`, {
			headers: {
				Accept: 'application/json',
			},
		});

		const whyChooseUs = getWhyChooseUsFromResponse(response.data);
		renderWhyChooseUsCards(whyChooseUs);
	} catch (error) {
		console.error('Why choose us API xatolik:', error);
	}
}

async function loadServiceCategories() {
	try {
		const axios = await ensureAxios();
		const response = await axios.get(`${API_BASE_URL}${CATEGORIES_ENDPOINT}`, {
			headers: {
				Accept: 'application/json',
			},
		});

		const categories = getCategoriesFromResponse(response.data);
		const categoriesWithDetails = await enrichCategoriesWithServiceDetails(axios, categories);
		renderServicesCategories(categoriesWithDetails);
		initServiceCategorySwipers();
	} catch (error) {
		console.error('Categories API xatolik:', error);
	}
}

async function loadYoutubeVideos() {
	try {
		const axios = await ensureAxios();
		const response = await axios.get(`${API_BASE_URL}${YOUTUBE_VIDEOS_ENDPOINT}`, {
			headers: {
				Accept: 'application/json',
			},
		});

		const videos = getYoutubeVideosFromResponse(response.data);
		renderYoutubeVideos(videos);
		bindYoutubeVideoEvents();
	} catch (error) {
		console.error('Youtube videos API xatolik:', error);
	}
}

loadProjects();
loadClientReviews();
loadWorkSteps();
loadWhyChooseUs();
loadServiceCategories();
loadYoutubeVideos();


const bars = document.getElementById('bars');
const mediaMenu = document.querySelector('.media-menu');
const closeBtns = mediaMenu.querySelectorAll('.close');

bars.addEventListener('click', () => {
	mediaMenu.classList.add('open');
	document.body.style.overflow = 'hidden';
});

closeBtns.forEach(btn => {
	btn.addEventListener('click', () => {
		mediaMenu.classList.remove('open');
		document.body.style.overflow = '';
	});
});
